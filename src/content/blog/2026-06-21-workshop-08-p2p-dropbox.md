---
title: "Workshop 08: การติดตั้ง P2P Dropbox อย่างปลอดภัย ไร้รอยรั่วและไม่ต้องรัน Tunnel"
description: "แนวทางการตั้งค่าเครือข่าย WebRTC DataChannel ผ่าน Workers Signaling Server โดยไม่เปิดเผย AUTH_KEY สู่สาธารณะ"
pubDate: 2026-06-21
tags: ["Workshop 08", "P2P", "WebRTC", "Security"]
---

เวิร์กชอปที่ 8 มุ่งเน้นการส่งไฟล์ข้ามโหนดแบบ Peer-to-Peer โดยตรง (100% Direct P2P) โดยอาศัย WebRTC DataChannel และตัวจับคู่สัญญาณ (Signaling Broker) บน Cloudflare Workers หลีกเลี่ยงความยุ่งยากของการใช้ Cloudflare Tunnels บนเครื่องปลายทาง และแก้ไขช่องโหว่ความปลอดภัยที่อาจทำรหัสผ่านส่วนตัวรั่วไหล

### 1. สถาปัตยกรรม Direct P2P (No Tunnels)

การรับส่งข้อมูลผ่านโปรโตคอล WebRTC อาศัยขั้นตอนสำคัญดังนี้:
*   **Signaling Stage**: ทั้งผู้รับและผู้ส่งต่อเชื่อมเข้าหา Cloudflare Workers (`wss://phd-signaling.laris.workers.dev/ws`) เพื่อลงทะเบียนตัวตนและแลกเปลี่ยนข้อมูล SDP/ICE Candidate (ไม่มีการส่งไฟล์ผ่านโฮสต์นี้)
*   **P2P DataChannel Connection**: เมื่อจับคู่สำเร็จ ทั้งสองโหนดจะสถาปนาท่อส่งข้อมูลตรงข้ามเครือข่ายสำเร็จ ทำให้รับส่งไฟล์ได้โดยไม่ต้องเปิดพอร์ตหรือรัน Cloudflare Tunnels (`cloudflared`) บนโหนดเครื่องตัวเอง

### 2. นโยบายรักษาความปลอดภัยเพื่อป้องกันรหัสผ่านรั่วไหล

เพื่อป้องกันไม่ให้ `AUTH_KEY` หลุดเข้าไปในซอร์สโค้ดของ GitHub หรือห้องแชท Discord ให้ปฏิบัติตามแนวทางนี้อย่างเคร่งครัด:

1.  **ห้าม Hardcode คีย์**: หลีกเลี่ยงการเขียน `AUTH_KEY` ลงในโค้ดหรือสคริปต์รันตรงๆ
2.  **ใช้ไฟล์ `.env`**: แยกคีย์และข้อมูลแวดล้อมออกจากโค้ด โดยเก็บไว้ในไฟล์ `.env` ที่ระบุตัวตนเฉพาะเครื่อง
3.  **ตั้งค่า `.gitignore`**: ตรวจสอบว่ามีบรรทัด `.env` ในไฟล์ระบุละเว้นของ Git เสมอ
4.  **เรียกใช้ผ่าน Environment Variables**: โหลดค่าคีย์ผ่าน `process.env.AUTH_KEY` หรือโหลดค่าเข้า Environment ใน Shell ก่อนรันระบบ

### 3. การกำหนดค่า Canonical Environment

ประกาศตัวแปรสภาพแวดล้อมต่อไปนี้ในโฮสต์ของคุณ:

```bash
# พิกัดตัวจับสัญญาณ
export SIGNAL_URL=wss://phd-signaling.laris.workers.dev/ws

# รหัสผ่านเฉพาะโหนด (ดึงมาจาก .env ส่วนตัว ห้ามนำไปโพสต์สาธารณะ)
export AUTH_KEY=<private-key-from-env>

# ชื่อโหนดที่ไม่ซ้ำใคร ป้องกันการชนกันของ Peer
export PEER_NAME=mac1-receiver
```

### 4. วิธีการสั่งงานผ่านระบบ `maw dropbox`

ระบบ `maw` เป็นปลั๊กอินมาตรฐานที่ช่วยลดความซับซ้อนของการใช้คำสั่งดิบ:

*   **ตรวจสอบรายชื่อโหนดที่ออนไลน์อยู่**:
    ```bash
    maw dropbox peers
    ```
*   **เปิดเครื่องสแตนด์บายรับไฟล์ (Receiver)**:
    ```bash
    maw dropbox receive
    ```
*   **ส่งไฟล์ไปยังปลายทาง (Sender)**:
    ```bash
    maw dropbox send --to dustboy-phd ./file.md
    ```

### 5. วิธีการสั่งงานผ่าน raw PhD CLI (ทางเลือก)

กรณีต้องการประมวลผลผ่านสคริปต์ TypeScript ตรงโดยไม่ผ่านปลั๊กอิน `maw`:

*   **ฝั่งรับไฟล์**:
    ```bash
    bun run receiver.ts
    ```
*   **ฝั่งส่งไฟล์**:
    ```bash
    bun run send.ts --list
    bun run send.ts --to dustboy-phd ./file.md
    ```

### 6. บทเรียนและสิ่งที่ต้องตรวจสอบ (Checks)

*   **Peer Name Collision**: การตั้งชื่อผู้รับซ้ำกับผู้อื่นในระบบจะทำให้ตัวจับคู่สัญญาณจับคู่ผิดโหนด (เช่น เครื่องรับโหนดอื่นรับแทน) ควรเลือกใช้ชื่อเฉพาะเจาะจงของตนเองเสมอ
*   **Sender Log & Receiver Confirm**: ฝั่งส่งต้องมี Log ยืนยันการส่งสำเร็จ (`P2P DataChannel open` และ `Done: 1 sent`) และฝั่งรับต้องมีกลไกตรวจสอบว่าไฟล์ลงแฟ้มปลายทาง (`./uploads/` หรือ `./inbox/`) อย่างถูกต้องครบถ้วน
