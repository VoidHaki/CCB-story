import { NextResponse } from "next/server";
import { runTransaction, Table } from "@/lib/db";

// GET: List all tables
export async function GET() {
  try {
    const tables = await runTransaction((db) => db.tables, true); // readonly
    return NextResponse.json(tables);
  } catch (e) {
    console.error("GET tables error:", e);
    return NextResponse.json({ error: "Unable to load tables." }, { status: 500 });
  }
}

// POST: Add a new table
export async function POST(req: Request) {
  try {
    const { id, name } = await req.json();
    if (!id || !name) {
      return NextResponse.json({ error: "Missing table id or name" }, { status: 400 });
    }

    const result = await runTransaction((db) => {
      // Check if table already exists
      if (db.tables.some(t => t.id === String(id))) {
        return { error: "Table ID already exists", status: 400 };
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

      return { data: newTable };
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (e) {
    console.error("Error creating table:", e);
    return NextResponse.json({ error: "Unable to create table. Please try again." }, { status: 500 });
  }
}

// PUT: Rename a table
export async function PUT(req: Request) {
  try {
    const { id, name } = await req.json();
    if (!id || !name) {
      return NextResponse.json({ error: "Missing table id or name" }, { status: 400 });
    }

    const result = await runTransaction((db) => {
      const tableIndex = db.tables.findIndex(t => t.id === String(id));
      if (tableIndex === -1) {
        return null;
      }

      db.tables[tableIndex].name = String(name);
      return db.tables[tableIndex];
    });

    if (!result) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error("Error updating table:", e);
    return NextResponse.json({ error: "Unable to update table. Please try again." }, { status: 500 });
  }
}

// DELETE: Delete a table
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing table id" }, { status: 400 });
    }

    const result = await runTransaction((db) => {
      const initialCount = db.tables.length;
      db.tables = db.tables.filter(t => t.id !== String(id));
      return db.tables.length !== initialCount;
    });

    if (!result) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Error deleting table:", e);
    return NextResponse.json({ error: "Unable to delete table. Please try again." }, { status: 500 });
  }
}
