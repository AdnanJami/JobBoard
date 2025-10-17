from groq import Groq
import json
import re
from dotenv import load_dotenv
import os
load_dotenv()
def extract_job_info(post_text):
    prompt = f"""
    Extract structured information from the following job post.in this format
        Return JSON with keys:  
        "JobTitle": "",
  "Company": "",
  "Skills": [],
  "Salary": "",
  "Experience": "",
  "JobType" = 'FULL_TIME','PART_TIME','CONTRACT','REMOTE', 'INTERNSHIP',
  "Location": "",
  "Deadline": "",
  "Requirements": [],
  "Benefits": [],
  "Description": "",
  "job_url": ""

        Job Post:
        {post_text}
        """
    client = Groq(
        api_key=os.getenv("GROQ_API_KEY"),
    )

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="openai/gpt-oss-120b",
    )
    content = chat_completion.choices[0].message.content
    try:
        # First try direct JSON load
        structured = json.loads(content)
    except json.JSONDecodeError:
        # Fallback: extract all {...} blocks with regex
        matches = re.findall(r"\{.*?\}", content, re.DOTALL)

        if matches:
            structured = [json.loads(m) for m in matches]
        else:
            structured = []
    structured = structured[0] if isinstance(structured, list) else structured
    return structured

    