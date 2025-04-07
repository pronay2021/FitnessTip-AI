from flask import Flask, render_template, jsonify
import random
import time
from transformers import pipeline
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)

generator = pipeline("text2text-generation", model="google/flan-t5-large")

fitness_prompts = [
    "Give me a unique fitness tip for today.",
    "Share a health and workout tip.",
    "What's a useful exercise hack?",
    "Suggest a short but effective workout tip.",
    "Provide a nutrition tip for fitness lovers."
]


tip_history = []            # Storing generated tips in memory for display
current_tip = "Loading your first fitness tip..."

def get_fitness_tip():
    """Generates a different fitness tip using Flan-T5."""
    prompt = random.choice(fitness_prompts)  
    result = generator(prompt, max_length=50, num_return_sequences=1, do_sample=True, temperature=0.9, top_k=50)
    return result[0]['generated_text']

def scheduled_task():
    """Generates a new fitness tip and stores it in history."""
    global current_tip
    current_tip = get_fitness_tip()
    tip_history.append(current_tip)
    
    if len(tip_history) > 10:   # Keeping only the last 10 tips in history
        tip_history.pop(0)
    print(f"🔥 New Fitness Tip Generated: {current_tip}")


scheduler = BackgroundScheduler()   # Setting up scheduler to run every 10 seconds
scheduler.add_job(scheduled_task, 'interval', seconds=10) 
scheduler.start()

@app.route('/')
def index():
    """Rendering the main application page and reset history."""
    global tip_history
    return render_template('index.html')

@app.route('/get_current_tip')
def get_current_tip_route():
    """API endpoint to get the current tip."""
    return jsonify({
        'tip': current_tip,
        'history': tip_history
    })

@app.route('/generate_new_tip')
def generate_new_tip():
    """API endpoint to manually generate a new tip."""
    scheduled_task()  # Generating a new tip immediately
    return jsonify({
        'tip': current_tip,
        'history': tip_history
    })

if __name__ == '__main__':
   
    scheduled_task()         # Generating first tip before starting
    app.run(debug=True)