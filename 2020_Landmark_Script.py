import pandas as pd
from datetime import datetime
import json

# Load the landmark CSV
landmark_df = pd.read_csv("landmark.csv")

# Define API key and base URLs
api_key = "YOUR_API_KEY_HERE"
base_image_url = "https://maps.googleapis.com/maps/api/streetview"
base_viewer_url = "https://www.google.com/maps/@?api=1&map_action=pano&viewpoint="

# Construct the JSON-like list of dicts
landmark_json = []

for _, row in landmark_df.iterrows():
    entry = {
        "name": row["name"],
        "address": row["address"],
        "latitude": row["latitude"],
        "longitude": row["longitude"],
        "images": [
            {
                "year": 2020,
                "viewer_url": f"{base_viewer_url}{row['latitude']},{row['longitude']}",
                "image_url": f"{base_image_url}?size=600x400&location={row['latitude']},{row['longitude']}&fov=80&heading=70&pitch=0&key={api_key}",
                "timestamp": datetime.utcnow().isoformat()
            }
        ]
    }
    landmark_json.append(entry)

# Save to file
with open("landmarks_in_2020.json", "w") as f:
    json.dump(landmark_json, f, indent=2)

print("✅ JSON file saved as 'landmarks_in_2020.json'")
