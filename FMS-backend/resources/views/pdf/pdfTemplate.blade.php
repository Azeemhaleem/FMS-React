<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Charged Fines Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .subtitle {
            font-size: 14px;
            color: #555;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: left;
            padding: 8px;
            border: 1px solid #ddd;
        }
        td {
            padding: 8px;
            border: 1px solid #ddd;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .footer {
            margin-top: 30px;
            text-align: right;
            font-size: 10px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Charged Fines Report</div>
        <div class="subtitle">Police User ID: {{ $policeUserId }}</div>
        <div class="subtitle">Generated on: {{ date('Y-m-d H:i:s') }}</div>
    </div>

    <table width="100%" cellspacing="0" cellpadding="6" border="1">
    <thead>
        <tr>
            <th style="text-align:left;">Charged Fine ID</th>
            <th style="text-align:left;">Fine</th>        {{-- name instead of id --}}
            <th style="text-align:left;">Driver License</th>
            <th style="text-align:left;">Issued At</th>
        </tr>
    </thead>
    <tbody>
        @foreach($fines as $f)
            <tr>
                <td>{{ $f->id }}</td>
                <td>{{ $f->fine_name }}</td>              {{-- <-- here --}}
                <td>{{ $f->driver_license }}</td>
                <td>{{ $f->issued_at }}</td>
            </tr>
        @endforeach
    </tbody>
    </table>


    <div class="footer">
        Total Fines: {{ $fines->count() }}
    </div>
</body>
</html>