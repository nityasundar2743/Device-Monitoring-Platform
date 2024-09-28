from pymongo import MongoClient

# MongoDB connection details
MONGO_URI = 'mongodb+srv://nitya:1234@remotewatch.e6zcabc.mongodb.net/?retryWrites=true&w=majority&appName=RemoteWatch'
DATABASE_NAME = 'RemoteWatch'


def connect_db(collection_name):
    # Create a MongoDB client
    client = MongoClient(MONGO_URI)
    
    # Access the database and collection
    db = client[DATABASE_NAME]
    collection = db[collection_name]
    
    return client, collection

def close_database(client):
    client.close()