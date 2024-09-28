import datetime
import platform
import psutil
import socket
import cpuinfo
import time

def getname():
    return platform.node()

def get_system_info():
    info = {}

    # Basic system information
    info['Name'] = platform.node()
    info['OS'] = platform.uname().system + " " + platform.release()
    info['Version'] = platform.version()
    try:
        processor_info = cpuinfo.get_cpu_info()['brand_raw']
    except KeyError:
        try:
            processor_info = cpuinfo.get_cpu_info()['brand']
        except KeyError:
            processor_info = "Unknown Processor"
    info['Processor'] = processor_info
    info['Architecture'] = platform.architecture()[0]

    # Network information
    info['Hostname'] = socket.gethostname()
    info['IP Address'] = socket.gethostbyname(socket.gethostname())

    # CPU information
    info['Physical cores'] = psutil.cpu_count(logical=False)
    info['Logical cores'] = psutil.cpu_count(logical=True)
    info['Max Frequency'] = round(psutil.cpu_freq().max / 1000, 3)

    # Memory information
    svmem = psutil.virtual_memory()
    info['Total Memory'] = round(svmem.total / (1024 * 1024 * 1024), 2)
    info['Available Memory'] = round(svmem.available / (1024 * 1024 * 1024), 2)
    info['Used Memory'] = round(svmem.used / (1024 * 1024 * 1024), 2)

    # Disk information
    partitions = psutil.disk_partitions()
    for partition in partitions:
        usage = psutil.disk_usage(partition.mountpoint)
        if usage.total / (1024 * 1024 * 1024) < 1:
            continue
        info['Disk Total Space'] = round(usage.total / (1024 * 1024 * 1024), 2)
        info['Disk Used Space'] = round(usage.used / (1024 * 1024 * 1024), 2)
        info['Disk Free Space'] = round(usage.free / (1024 * 1024 * 1024), 2)
        info['Disk Usage'] = usage.percent

    # Network details
    net_io = psutil.net_io_counters()
    info['Total Bytes Sent'] = net_io.bytes_sent
    info['Total Bytes Received'] = net_io.bytes_recv

    # System uptime
    uptime_seconds = int(time.time() - psutil.boot_time())
    uptime_hours = uptime_seconds // 3600
    uptime_seconds %= 3600
    uptime_minutes = uptime_seconds // 60
    uptime_seconds %= 60
    uptime_hms = f"{uptime_hours:02}:{uptime_minutes:02}:{uptime_seconds:02}"
    info['Uptime'] = uptime_hms

    # Time
    info['Timestamp'] = datetime.datetime.now().time().strftime('%H:%M:%S')

    # Wrapping the info dictionary in a list
    return [info]


if __name__ == "__main__":
    system_info = get_system_info()
    for info in system_info:
        for key, value in info.items():
            print(f"{key}: {value}")
