# Chapter 247 Backend

A backend service proxying requests to DummyJSON.

## Prerequisites

- Node.js installed
- NPM installed

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
PORT=4000
DUMMYJSON_BASE=https://dummyjson.com
```

## Running the Project

Start the development server:
```bash
npm start
```

The server will start on port 4000 (or the port specified in `.env`).
