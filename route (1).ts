<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline | Cheerio 2026</title>
    <style>
        body {
            background-color: #000000;
            color: #d4af37; /* Gold color matching the site theme */
            font-family: 'Inter', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            text-align: center;
        }
        h1 { font-size: 2rem; margin-bottom: 1rem; }
        p { font-size: 1.1rem; color: #a0a0a0; }
        .retry-btn {
            margin-top: 2rem;
            padding: 0.8rem 2rem;
            background-color: #d4af37;
            color: #000;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
    </style>
</head>
<body>
    <h1>Connection Lost</h1>
    <p>You are currently offline. Please reconnect to access the Eternal Ledger.</p>
    <a href="javascript:window.location.reload();" class="retry-btn">Try Reconnecting</a>
</body>
</html>
