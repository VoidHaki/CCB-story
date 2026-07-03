import { NextResponse } from "next/server";
import { readDb, writeDb, Table } from "@/lib/db";

// GET: List all tables
export async function GET() {
  const db = readDb();
  return NextResponse.json(db.tables);
}

// POST: Add a new table
export async function POST(req: Request) {
  try {
    const { id, name } = await req.json();
    if (!id || !name) {
      return NextResponse.json({ error: "Missing table id or name" }, { status: 400 });
    }

    const db = readDb();
    
    // Check if table already exists
    if (db.tables.some(t => t.id === String(id))) {
      return NextResponse.json({ error: "Table ID already exists" }, { status: 400 });
    }

    const newTable: Table = {
      id: String(id),
      name: String(name)
    };

    db.tables.push(newTable);
    // Sort tables by integer ID value if possible
    db.tables.sort((a, b) => {
      const numA = parseInt(a.id, 10);
      const numB = parseInt(b.id, 10);
      if (isNaN(numA) || isNaN(numB)) {
        return a.id.localeCompare(b.id);
      }
      return numA - numB;
    });

    writeDb(db);
    return NextResponse.json(newTable);
  } catch (e) {
    console.error("Error creating table:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT: Rename a table
export async function PUT(req: Request) {
  try {
    const { id, name } = await req.json();
    if (!id || !name) {
      return NextResponse.json({ error: "Missing table id or name" }, { status: 400 });
    }

    const db = readDb();
    const tableIndex = db.tables.findIndex(t => t.id === String(id));

    if (tableIndex === -1) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    db.tables[tableIndex].name = String(name);
    writeDb(db);

    return NextResponse.json(db.tables[tableIndex]);
  } catch (e) {
    console.error("Error updating table:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: Delete a table
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing table id" }, { status: 400 });
    }

    const db = readDb();
    const initialCount = db.tables.length;
    db.tables = db.tables.filter(t => t.id !== String(id));

    if (db.tables.length === initialCount) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    writeDb(db);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error deleting table:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
