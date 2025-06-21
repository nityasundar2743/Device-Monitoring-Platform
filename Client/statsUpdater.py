import time
from pymongo import MongoClient
import datetime
import platform
from monitor import CPUUsageMonitor, MemoryUsageMonitor, DiskUsageMonitor

# MongoDB connection details
MONGO_URI = 'mongodb+srv://nitya:1234@remotewatch.e6zcabc.mongodb.net/?retryWrites=true&w=majority&appName=RemoteWatch'
DATABASE_NAME = 'RemoteWatch'
COLLECTION_NAME = 'usageStatistics'

def connect_database():
    # Create a MongoDB client
    client = MongoClient(MONGO_URI)
        
    # Access the database and collection
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    
    return client, db, collection

def close_database(client):
    client.close()

def update_data(collection):
    
    # Get system information
    cpuHistory = cpuMonitor.get_cpu_usage_history()
    avgCPUUsage = cpuMonitor.get_avg_cpu_usage()
    memHistory = memMonitor.get_memory_usage_history()
    avgMemUsage = memMonitor.get_avg_memory_usage()
    diskHistory = diskMonitor.get_disk_usage_history()
    timeStamp = datetime.datetime.now().strftime('%H:%M:%S')

    name = platform.node()
    
    # Create the update document
    update_document = {
        'Name': name,
        'avgCPUUsage': avgCPUUsage,
        'cpuUsageHistory': cpuHistory,
        'avgMemUsage': avgMemUsage,
        'memUsageHistory': memHistory,
        'diskUsageHistory': diskHistory,
        'timestamp': timeStamp
    }
    
    # Upsert the document in MongoDB
    collection.update_one(
        {'Name': name},  # Filter document by 'Name'
        {'$set': update_document},  # Update document with new data
        upsert=True  # Insert document if it does not exist
    )
    
    print("Data uploaded, timestamp - " + timeStamp)

if __name__ == "__main__":
    cpuMonitor = CPUUsageMonitor(max_samples=60, sample_interval=1)
    memMonitor = MemoryUsageMonitor(max_samples=60, sample_interval=1)
    diskMonitor = DiskUsageMonitor(max_samples=60, sample_interval=1)
    client, db, collection = connect_database()
    try:
        while True:
            update_data(collection)
            time.sleep(30)  # Sleep for 30 seconds before updating again
    except KeyboardInterrupt:
        memMonitor.stop()
        cpuMonitor.stop()
        print("Monitoring stopped due to keyboard interrupt.")
    finally:
        close_database(client)
        print("Database connection closed.")
