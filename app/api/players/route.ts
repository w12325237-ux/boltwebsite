export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const playerSchema = new mongoose.Schema({
  ign: String,
  region: String,
  tiers: Object,
  points: Number,
  rank: String,
  premium: Boolean,
});

const Player =
  mongoose.models.Player || mongoose.model("Player", playerSchema);

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URI as string);
}

export async function GET() {
  try {
    await connectDB();
    const players = await Player.find().sort({ points: -1 });
    return NextResponse.json(players);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}