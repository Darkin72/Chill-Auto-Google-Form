import requests
import re
import json
from glom import glom


class Extractor:
    def __init__(self):
        print("Extractor initialized.")

    def extract(self, url):
        print(f"Extracting data from {url}")
        try:
            response = requests.get(url)
            # Check if the request was successful
            if response.status_code != 200:
                print(f"Failed to retrieve data, status code: {response.status_code}")
                return None

            # Find FB_PUBLIC_LOAD_DATA_ in the response text
            match = re.search(r"var\s+FB_LOAD_DATA_\s*=\s*(\[.*?\]\s*);", response.text)

            if match:
                data = match.group(1)
                # Parse the JSON data
                form_data = json.loads(data)
                print(f"Extracted data: {json.dumps(form_data, ensure_ascii=False)}")
                return {
                    "link_edit": url,
                    "title": glom(
                        form_data,
                        "0.1.25.1",
                        default=glom(form_data, "0.3", default=None),
                    ),
                    "description": glom(form_data, "0.1.24.1", default=None),
                    "link_viewform": glom(form_data, "0.14", default=None),
                    "questions": glom(form_data, "0.1.1", default=[]),
                }
            return None
        except requests.exceptions.RequestException as e:
            print(f"An error occurred: {e}")
            return None
