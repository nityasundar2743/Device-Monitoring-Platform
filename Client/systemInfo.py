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
    info['device_id'] = platform.node()
    info['name'] = platform.node()
    info['os'] = platform.uname().system + " " + platform.release()
    info['version'] = platform.version()

    try:
        processor_info = cpuinfo.get_cpu_info().get('brand_raw') or cpuinfo.get_cpu_info().get('brand')
    except Exception:
        processor_info = "Unknown Processor"
    info['processor'] = processor_info
    info['architecture'] = platform.architecture()[0]

    # Network information
    info['hostname'] = socket.gethostname()
    try:
        info['ip_address'] = socket.gethostbyname(socket.gethostname())
    except:
        info['ip_address'] = "Unavailable"

    # CPU
    info['physical_cores'] = psutil.cpu_count(logical=False)
    info['logical_cores'] = psutil.cpu_count(logical=True)
    info['max_frequency'] = round(psutil.cpu_freq().max / 1000, 3)  # in GHz

    # Memory
    svmem = psutil.virtual_memory()
    info['total_memory'] = round(svmem.total / (1024 ** 3), 2)
    info['available_memory'] = round(svmem.available / (1024 ** 3), 2)
    info['used_memory'] = round(svmem.used / (1024 ** 3), 2)

    # Disk
    partitions = psutil.disk_partitions()
    for partition in partitions:
        try:
            usage = psutil.disk_usage(partition.mountpoint)
            if usage.total / (1024 ** 3) < 1:
                continue
            info['disk_total_space'] = round(usage.total / (1024 ** 3), 2)
            info['disk_used_space'] = round(usage.used / (1024 ** 3), 2)
            info['disk_free_space'] = round(usage.free / (1024 ** 3), 2)
            info['disk_usage'] = usage.percent
            break  # Use only the first valid partition
        except:
            continue

    # Network I/O
    net_io = psutil.net_io_counters()
    info['total_bytes_sent'] = net_io.bytes_sent
    info['total_bytes_received'] = net_io.bytes_recv

    # Uptime
    uptime_seconds = int(time.time() - psutil.boot_time())
    uptime_hours = uptime_seconds // 3600
    uptime_seconds %= 3600
    uptime_minutes = uptime_seconds // 60
    uptime_seconds %= 60
    info['uptime'] = f"{uptime_hours:02}:{uptime_minutes:02}:{uptime_seconds:02}"

    # Timestamp
    info['timestamp'] = datetime.datetime.now().strftime('%Y-%m-%dT%H:%M:%S')

    return info


if __name__ == "__main__":
    system_info = get_system_info()
    for key, value in system_info.items():
        print(f"{key}: {value}")
