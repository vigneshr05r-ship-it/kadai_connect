import socket

def check_port(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

if __name__ == "__main__":
    print(f"Port 8000 open: {check_port(8000)}")
    print(f"Port 8005 open: {check_port(8005)}")
    print(f"Port 3000 open: {check_port(3000)}")
