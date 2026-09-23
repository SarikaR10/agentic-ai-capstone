import requests
import os
import argparse
import json

parser = argparse.ArgumentParser()
parser.add_argument("--jiraId", required=True)

args = parser.parse_args()

jira_url = os.getenv("JIRA_BASE_URL")
email = os.getenv("JIRA_EMAIL")
token = os.getenv("JIRA_API_TOKEN")

url = f"{jira_url}/rest/api/2/issue/{args.jiraId}"

response = requests.get(
    url,
    auth=(email, token),
    headers={"Accept": "application/json"}
)

issue = response.json()

result = {
    "key": issue["key"],
    "summary": issue["fields"].get("summary", ""),
    "description": issue["fields"].get("description", ""),
    "issueType": issue["fields"]["issuetype"]["name"]
}

print(json.dumps(result))