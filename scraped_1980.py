import pandas as pd
import json
from datetime import datetime
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Load all landmarks
df = pd.read_csv("landmark.csv")
landmarks = df.to_dict(orient="records")

# Setup screenshot folder (optional)
os.makedirs("screenshots_1980s", exist_ok=True)

# Paths for browser
options = Options()
options.add_argument("--headless")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.binary_location = "/usr/bin/chromium"
chromedriver_path = "/usr/local/bin/chromedriver"

scraped_data = []

for lm in landmarks:
    driver = webdriver.Chrome(service=Service(chromedriver_path), options=options)

    lat = round(lm["latitude"], 4)
    lng = round(lm["longitude"], 4)
    viewer_url = f"https://80s.nyc/#show/{lat}/{lng}"

    print(f"\n🌐 Scraping {lm['name']} @ {viewer_url}")
    driver.get(viewer_url)

    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//span[text()='YOU ARE HERE']"))
        )
        image_elems = driver.find_elements(By.XPATH, "//span[text()='YOU ARE HERE']/preceding-sibling::img")
        image_urls = [img.get_attribute("src") for img in image_elems if img.get_attribute("src")]

        print(f"✅ Found {len(image_urls)} images.")

    except Exception as e:
        print(f"⚠️ Skipped {lm['name']} — {e}")
        image_url = "no image"

    # Optional screenshot
    screenshot_name = lm["name"].replace(" ", "_").replace("/", "_") + "_1980.png"
    driver.save_screenshot(f"screenshots_1980s/{screenshot_name}")
    driver.quit()

    scraped_data.append({
        "name": lm["name"],
        "address": lm["address"],
        "latitude": lat,
        "longitude": lng,
        "images": [
            {
                "year": 1980,
                "viewer_url": viewer_url,
                "image_urls": image_urls,
                "timestamp": datetime.now().isoformat()
            }
        ]
    })

# Save to JSON
with open("landmarks_in_1980s41.json", "w") as f:
    json.dump(scraped_data, f, indent=2)

print("\n✅ Full scrape complete. Output saved to landmarks_in_1980s41.json")

