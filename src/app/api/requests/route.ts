import { NextResponse } from "next/server";
import { readDb, writeDb, CafeRequest } from "@/lib/db";

// GET: List active requests and history
export async function GET() {
  const db = readDb();
  return NextResponse.json({
    requests: db.requests,
    history: db.history
  });
}

// POST: Submit a new request from a table
export async function POST(req: Request) {
  try {
    const { tableId, type } = await req.json();
    if (!tableId || !type) {
      return NextResponse.json({ error: "Missing tableId or type" }, { status: 400 });
    }

    const db = readDb();
    
    // Find table name
    const table = db.tables.find(t => t.id === String(tableId));
    const tableName = table ? table.name : `Table ${tableId}`;

    const newRequest: CafeRequest = {
      id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tableId: String(tableId),
      tableName,
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: "pending"
    };

    db.requests.unshift(newRequest); // Add to the top of the queue
    writeDb(db);

    return NextResponse.json(newRequest);
  } catch (e) {
    console.error("Error creating request:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT: Resolve a request (move to history)
export async function PUT(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing request id" }, { status: 400 });
    }

    const db = readDb();
    const reqIndex = db.requests.findIndex(r => r.id === id);
    
    if (reqIndex === -1) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const resolvedRequest = {
      ...db.requests[reqIndex],
      status: "resolved" as const,
      resolvedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    // Remove from active requests and push to history
    db.requests.splice(reqIndex, 1);
    db.history.unshift(resolvedRequest);
    writeDb(db);

    return NextResponse.json(resolvedRequest);
  } catch (e) {
    console.error("Error resolving request:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: Clear history or active requests
export async function DELETE(req: Request) {
  try {
    const { url } = req;
    const { searchParams } = new URL(url);
    const mode = searchParams.get("mode") || "history"; // "history" or "all" or "active"

    const db = readDb();
    if (mode === "history") {
      db.history = [];
    } else if (mode === "active") {
      db.requests = [];
    } else if (mode === "all") {
      db.requests = [];
      db.history = [];
    }
    
    writeDb(db);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error clearing requests:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
