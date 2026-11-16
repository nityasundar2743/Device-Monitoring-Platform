import datetime
import platform
import psutil
import socket
import time

try:
    import cpuinfo
except ImportError:
    cpuinfo = None

_STATIC_INFO = None

def getname():
    return platform.node()

def get_static_system_info():
    global _STATIC_INFO
    if _STATIC_INFO is None:
        static_info = {}
        static_info['device_id'] = platform.node()
        static_info['os'] = platform.uname().system + " " + platform.release()
        static_info['version'] = platform.version()

        processor_info = platform.processor() or "Unknown Processor"
        if cpuinfo:
            try:
                cinfo = cpuinfo.get_cpu_info()
                processor_info = cinfo.get('brand_raw') or cinfo.get('brand') or processor_info
            except Exception:
                pass
        static_info['processor'] = processor_info
        static_info['architecture'] = platform.architecture()[0]

        static_info['hostname'] = socket.gethostname()
        try:
            static_info['ip_address'] = socket.gethostbyname(socket.gethostname())
        except Exception:
            static_info['ip_address'] = "Unavailable"

        static_info['physical_cores'] = psutil.cpu_count(logical=False) or 1
        static_info['logical_cores'] = psutil.cpu_count(logical=True) or 1
        try:
            freq = psutil.cpu_freq()
            static_info['max_frequency'] = round(freq.max / 1000, 3) if freq and freq.max else 0.0
        except Exception:
            static_info['max_frequency'] = 0.0

        try:
            svmem = psutil.virtual_memory()
            static_info['total_memory'] = round(svmem.total / (1024 ** 3), 2)
        except Exception:
            static_info['total_memory'] = 0.0

        _STATIC_INFO = static_info

    return dict(_STATIC_INFO)

def get_system_info():
    info = get_static_system_info()

    # Dynamic Memory
    svmem = psutil.virtual_memory()
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
        except Exception:
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
