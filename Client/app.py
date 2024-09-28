import json
from flask import Flask, jsonify
from flask_cors import CORS
import dbManager

COLLECTION_NAME_1 = 'devices'
COLLECTION_NAME_2 = 'usageStatistics'

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/devices', methods=['GET'])
def get_devices():    
    # Fetch all documents from the collection
    fetched_data = list(collection1.find({}))
    
    # Convert ObjectId to string representation
    for document in fetched_data:
        document['_id'] = str(document['_id'])

    # Return JSON response
    return jsonify(fetched_data)

@app.route('/api/usage', methods=['GET'])
def get_usage(): 
    # Fetch all documents from the collection
    fetched_data = list(collection2.find({}))
    
    # Convert ObjectId to string representation
    for document in fetched_data:
        document['_id'] = str(document['_id'])

    # Return JSON response
    return jsonify(fetched_data)



if __name__ == '__main__':
    client1, collection1 = dbManager.connect_db(COLLECTION_NAME_1)
    client2, collection2 = dbManager.connect_db(COLLECTION_NAME_2)
    try:
        app.run(debug=True)
    except KeyboardInterrupt:
        print("App stopped due to keyboard interrupt")
    finally:
        dbManager.close_database(client1)
        dbManager.close_database(client2)
        print("Database connections closed")