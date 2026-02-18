import requests
from bs4 import BeautifulSoup
import urllib.parse
import time
import random

def scrape_query(query):
    """
    Fetches and parses Search Engine Results Pages (SERP) data using DuckDuckGo HTML.
    """
    url = "https://html.duckduckgo.com/html/"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    }
    
    # DuckDuckGo HTML uses a POST request for queries
    data = {"q": query}
    
    try:
        # Step 1: Thread Jittering
        # Introduce a randomized delay (1 to 3 seconds) to prevent threads from firing simultaneously.
        time.sleep(random.uniform(1.0, 3.0))
        
        # Step 2: Execute POST Request
        response = requests.post(url, headers=headers, data=data, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        results = []
        
        # Step 3: Parse Target Containers
        # DuckDuckGo wraps results in 'div.result__body' and titles in 'a.result__a'
        for result in soup.select(".result__body"):
            title_tag = result.select_one(".result__title .result__a")
            
            if title_tag:
                title = title_tag.get_text(strip=True)
                raw_link = title_tag.get("href")
                
                # Step 4: URL Decoding
                # DuckDuckGo redirects links. We extract the actual URL from the 'uddg=' parameter.
                link = raw_link
                if raw_link and raw_link.startswith("//duckduckgo.com/l/?uddg="):
                    link = urllib.parse.unquote(raw_link.split("uddg=")[1].split("&")[0])
                    
                results.append({
                    "query": query,
                    "title": title,
                    "link": link
                })
                
        # Failsafe if selectors yield no data
        if not results:
            return [{"query": query, "title": "ERROR: No data found. Selectors failed.", "link": "#"}]
            
        return results

    except Exception as e:
        return [{"query": query, "title": f"HTTP Error: {str(e)}", "link": "#"}]