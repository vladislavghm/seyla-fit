import { NextResponse } from "next/server";
import { sendTrialLeadEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!fullName || fullName.length < 2) {
      return NextResponse.json(
        { error: "Укажите ФИО" },
        { status: 400 }
      );
    }
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { error: "Укажите корректный номер телефона" },
        { status: 400 }
      );
    }

    await sendTrialLeadEmail({ fullName, phone });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Trial form error:", err);
    return NextResponse.json(
      { error: "Не удалось отправить заявку. Попробуйте позже или позвоните нам." },
      { status: 500 }
    );
  }
}
