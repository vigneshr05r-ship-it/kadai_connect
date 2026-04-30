#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

echo "--- DEBUG INFO ---"
echo "DB_HOST is set to: '${DB_HOST}'"
echo "------------------"

# Run migrations
python manage.py migrate
