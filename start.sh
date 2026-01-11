#!/bin/bash

# Create tables if database doesn't exist
python create_table.py

# Seed data if database is empty
python seed_data.py

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port $PORT
