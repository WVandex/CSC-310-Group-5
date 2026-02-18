import json
import os
from flask import request, jsonify
from app import app
from .scraper import scrape_query
from concurrent.futures import ThreadPoolExecutor

# Configuration Constants
RESULTS_FILE = 'data/serp_results.json'
MAX_WORKERS = 5

def analyze_titles(scraped_data):
    """
    Analyzes the scraped titles for distinct deep learning models,
    and sorts them by frequency to meet assignment requirements.
    """
    # Expanded list to include both specific models and broad terminology
    target_models = ["cnn", "rnn", "lstm", "transformer", "gan", "bert", "yolo", "neural", "machine", "artificial"]
    
    frequency = {model.upper(): 0 for model in target_models}
    
    for item in scraped_data:
        title_lower = item.get("title", "").lower()
        
        for model in target_models:
            if model in title_lower:
                frequency[model.upper()] += 1
                
    # Filter out models with a count of 0 to keep the chart clean
    analysis_results = [{"name": key, "count": value} for key, value in frequency.items() if value > 0]
    
    # REQUIRED ASSIGNMENT FIX: 
    # Sort the features in descending order based on the number of systems (count).
    analysis_results = sorted(analysis_results, key=lambda x: x['count'], reverse=True)
    
    return analysis_results

@app.route('/', methods=['GET'])
def welcome():
    """
    Root endpoint serving as an API health check.
    """
    return jsonify({
        "message": "SERP Analyzer API is operational.",
        "status": "active"
    }), 200

@app.route('/scrape', methods=['POST'])
def start_scraping():
    """
    Endpoint to receive queries, trigger concurrent scraping, and execute data analysis.
    """
    # 1. Payload Validation
    data = request.get_json()
    if not data or 'queries' not in data:
        return jsonify({"error": "No queries provided"}), 400
        
    queries = data.get('queries', [])
    all_data = []
    
    # 2. Multithreaded Execution
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        results_generator = executor.map(scrape_query, queries)
        
        for result_list in results_generator:
            all_data.extend(result_list)

    # 3. Data Analysis & Sorting
    visualization_data = analyze_titles(all_data)

    # 4. Data Persistence
    os.makedirs(os.path.dirname(RESULTS_FILE), exist_ok=True)
    
    try:
        with open(RESULTS_FILE, 'w') as f:
            # Save both the raw data and the analyzed frequency data
            json.dump({"data": all_data, "analysis": visualization_data}, f, indent=4)
    except Exception as e:
        return jsonify({"error": f"Failed to save results: {str(e)}"}), 500

    # 5. Response Construction
    return jsonify({
        "status": "success",
        "total_results": len(all_data),
        "data": all_data,
        "analysis": visualization_data
    })

@app.route('/results', methods=['GET'])
def get_results():
    """
    Endpoint to retrieve previously saved scraping results and analysis.
    """
    if os.path.exists(RESULTS_FILE):
        try:
            with open(RESULTS_FILE, 'r') as f:
                return jsonify(json.load(f))
        except Exception as e:
            return jsonify({"error": f"Failed to read data: {str(e)}"}), 500
            
    # Return safely structured empty arrays if no scrape has occurred yet
    return jsonify({
        "data": [],
        "analysis": []
    }), 200