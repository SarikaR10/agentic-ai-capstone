import argparse
import json
import os
import requests
from requests.auth import HTTPBasicAuth

# --- Configuration ---
JIRA_BASE_URL = os.getenv("JIRA_BASE_URL")
JIRA_USER = os.getenv("JIRA_EMAIL")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")

ISSUE_TYPE = "Test"

# Exact Custom Field IDs from your Jira instance
TEST_STEPS_FIELD = "customfield_19206"
EXPECTED_RESULT_FIELD = "customfield_19207"


def load_test_cases(json_path):
  """Loads test cases from JSON file."""
  if not os.path.exists(json_path):
    raise FileNotFoundError(f"Test cases file not found at: {json_path}")
  with open(json_path, "r", encoding="utf-8") as f:
    return json.load(f)


def create_jira_test_case(session, auth, test_case, project_key):
  """Creates a single test case issue in Jira with steps and expected results."""
  url = f"{JIRA_BASE_URL.rstrip('/')}/rest/api/2/issue"

  # Extract test steps and format them
  steps = test_case.get("steps", test_case.get("test_steps", ""))
  if isinstance(steps, list):
    steps_text = "\n".join([f"{i+1}. {step}" for i, step in enumerate(steps)])
  else:
    steps_text = str(steps)

  # Extract expected result
  expected = test_case.get(
      "expected_result", test_case.get("expected", "As expected")
  )
  if isinstance(expected, list):
    expected_text = "\n".join(
        [f"{i+1}. {exp}" for i, exp in enumerate(expected)]
    )
  else:
    expected_text = str(expected)

  # Construct payload
  payload = {
      "fields": {
          "project": {"key": project_key},
          "issuetype": {"name": ISSUE_TYPE},
          "summary": test_case.get(
              "title", test_case.get("summary", "Automated STLC Test Case")
          ),
          "priority": {"name": test_case.get("priority", "Low")},
          TEST_STEPS_FIELD: steps_text,
          EXPECTED_RESULT_FIELD: expected_text,
      }
  }

  print(
      f"📤 Sending Payload for: {test_case.get('title', 'Test Case')} (Project:"
      f" {project_key})"
  )

  response = session.post(url, json=payload, auth=auth, headers={"Content-Type": "application/json"})

  if response.status_code == 201:
    issue_data = response.json()
    print(
        f"✅ Successfully created Jira Test: {issue_data.get('key')} -"
        f" {test_case.get('title', '')}"
    )
    return issue_data.get("key")
  else:
    print(
        f"❌ Failed to create test case. Status: {response.status_code},"
        f" Response: {response.text}"
    )
    return None


def link_issues(session, auth, test_key, story_key):
  """Links the newly created Jira Test case to the parent User Story."""
  url = f"{JIRA_BASE_URL.rstrip('/')}/rest/api/2/issueLink"
  payload = {
      "type": {"name": "Relates"},
      "inwardIssue": {"key": test_key},
      "outwardIssue": {"key": story_key},
  }

  response = session.post(url, json=payload, auth=auth, headers={"Content-Type": "application/json"})

  if response.status_code == 201:
    print(f"🔗 Linked test {test_key} to story {story_key}")
  else:
    print(
        f"⚠️ Warning: Failed to link {test_key} to {story_key}:"
        f" {response.text}"
    )

def transition_issue_to_in_progress(session, auth, issue_key):
  """Dynamically finds and executes the 'Start Progress' or 'In Progress' transition."""
  base_url = JIRA_BASE_URL.rstrip("/")
  transitions_url = f"{base_url}/rest/api/2/issue/{issue_key}/transitions"

  response = session.get(transitions_url, auth=auth)
  if response.status_code != 200:
    print(
        f"⚠️ Warning: Could not fetch transitions for {issue_key}:"
        f" {response.text}"
    )
    return

  transitions = response.json().get("transitions", [])
  target_transition_id = None

  for t in transitions:
    t_name = t.get("name", "").lower()
    # Match either "in progress" or "start progress"
    if "in progress" in t_name or "start progress" in t_name:
      target_transition_id = t.get("id")
      break

  if not target_transition_id:
    print(
        f"ℹ️ Note: Transition to 'In Progress' not available for {issue_key}"
        f" (Current status might already be In Progress or Done). Available:"
        f" {[t.get('name') for t in transitions]}"
    )
    return

  payload = {"transition": {"id": target_transition_id}}
  trans_response = session.post(
      transitions_url,
      json=payload,
      auth=auth,
      headers={"Content-Type": "application/json"},
  )

  if trans_response.status_code == 204:
    print(f"🔄 Successfully transitioned {issue_key} to In Progress")
  else:
    print(
        f"⚠️ Warning: Failed to transition {issue_key}. Status:"
        f" {trans_response.status_code}, Response: {trans_response.text}"
    )

def main():
  parser = argparse.ArgumentParser(
      description="Upload test cases from JSON to Jira and transition them"
  )
  parser.add_argument(
      "--input", default="testcases.json", help="Path to testcases.json"
  )
  parser.add_argument(
      "--story",
      required=True,
      help="Parent Jira User Story key (e.g. EPMCDMETST-59685)",
  )
  args = parser.parse_args()

  # Extract project key from story key (e.g., EPMCDMETST-59685 -> EPMCDMETST)
  if "-" in args.story:
    project_key = args.story.split("-")[0]
  else:
    raise ValueError(
        "Invalid story format. Must include project prefix like"
        " EPMCDMETST-123"
    )

  test_cases = load_test_cases(args.input)
  print(
      f"📂 Loaded {len(test_cases)} test cases from {args.input} for project:"
      f" {project_key}"
  )

  session = requests.Session()
  auth = HTTPBasicAuth(JIRA_USER, JIRA_API_TOKEN)

  for tc in test_cases:
    test_key = create_jira_test_case(session, auth, tc, project_key)
    if test_key:
      # 1. Link to parent user story
      link_issues(session, auth, test_key, args.story)
      # 2. Transition test case to In Progress
      transition_issue_to_in_progress(session, auth, test_key)

  # 3. Transition parent user story to In Progress
  print(f"🔄 Moving parent story {args.story} to 'In Progress'...")
  transition_issue_to_in_progress(session, auth, args.story)


if __name__ == "__main__":
  main()