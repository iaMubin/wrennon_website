// Wrennon Live Demo — static conversation dataset
//
// Timestamps are stored as relative offsets (start_minutes_ago / offset_sec)
// rather than fixed dates, and are converted to real ISO timestamps at load
// time based on the visitor's current clock. This keeps the agent dashboard,
// sidebar previews, and "Today / Yesterday" grouping looking naturally fresh
// no matter when someone views the live demo, instead of drifting further
// into the past (and eventually off the "Today/Yesterday" fast path) with
// every day that passes after this file was authored.
//
// Audio messages store the literal string "__AUDIO__" as a placeholder and
// carry an `audio_file` name on the parent chat; the real playable URL is
// built at runtime from `location.origin` so voice notes work correctly on
// whatever domain the demo is actually deployed to (Netlify preview, the
// production custom domain, or a local dev server).

const RAW_DEMO_SESSIONS = [
  {
    "session_id": "sess_a1f39c02e8b4",
    "short_id": "CUST-4471",
    "customer_email": "sarah.mitchell82@gmail.com",
    "handoff_active": false,
    "handled_by": null,
    "resolved": true,
    "reopen_count": 0,
    "sentiment": "happy",
    "language": "en",
    "sector": "e-commerce",
    "start_minutes_ago": 540,
    "order": {
      "order_id": "WR-88401",
      "status": "Delivered",
      "carrier": "FedEx",
      "eta": "Delivered",
      "tracking_url": "https://www.fedex.com/track"
    },
    "messages": [
      {
        "id": "1c80317f",
        "sender": "human",
        "content": "Hi! I just received my new Heritage Chronograph from order #WR-88401 and I'm in love with it already 😍",
        "offset_sec": 85
      },
      {
        "id": "bdd640fb",
        "sender": "human",
        "content": "![Image](images/chat-demo-watch.jpg)",
        "offset_sec": 131
      },
      {
        "id": "3eb13b90",
        "sender": "ai",
        "content": "Hello Sarah! That's wonderful to hear — the Heritage Chronograph is one of our most popular pieces. How can I help you today?",
        "offset_sec": 193
      },
      {
        "id": "23b8c1e9",
        "sender": "human",
        "content": "Is the strap genuine leather? I want to take proper care of it.",
        "offset_sec": 252
      },
      {
        "id": "1a3d1fa7",
        "sender": "ai",
        "content": "Yes, it's 100% full-grain Italian leather. I'd recommend keeping it away from prolonged moisture and conditioning it every few months with a leather balm to keep it supple.",
        "offset_sec": 344
      },
      {
        "id": "bd9c66b3",
        "sender": "human",
        "content": "Good to know. Is the watch itself water-resistant? I tend to forget to take it off before showering.",
        "offset_sec": 432
      },
      {
        "id": "16419f82",
        "sender": "ai",
        "content": "It's rated to 50 meters (5 ATM), so it'll handle splashes, rain, and hand-washing fine. I'd still avoid showering or swimming with it though — the leather strap will degrade much faster with repeated soaking, even if the case itself is sealed.",
        "offset_sec": 511
      },
      {
        "id": "6c031199",
        "sender": "human",
        "content": "Understood, I'll be careful. Does it come with a warranty?",
        "offset_sec": 593
      },
      {
        "id": "07a0ca6e",
        "sender": "ai",
        "content": "Yes — order #WR-88401 includes our standard 2-year international warranty covering the movement, dial, hands, and crown. Straps are considered a wear item and aren't covered, but we sell replacement straps separately if you ever need one.",
        "offset_sec": 640
      },
      {
        "id": "37f8a88b",
        "sender": "human",
        "content": "Perfect. One more thing — the second hand seems to tick every 2 seconds instead of every second, is that normal?",
        "offset_sec": 690
      },
      {
        "id": "815ef6d1",
        "sender": "ai",
        "content": "Completely normal! The Heritage Chronograph uses a quartz movement with a 2-second sweep to conserve battery life — it's designed that way, not a defect. A true 1-second tick would drain the battery about 30% faster.",
        "offset_sec": 749
      },
      {
        "id": "06cb0fb3",
        "sender": "human",
        "content": "Oh that makes total sense, thank you for explaining! Really appreciate the detailed answers.",
        "offset_sec": 832
      },
      {
        "id": "32e70629",
        "sender": "ai",
        "content": "Anytime, Sarah! Enjoy your new watch, and don't hesitate to reach out if anything else comes up.",
        "offset_sec": 912
      }
    ],
    "customer_name": "Sarah Mitchell"
  },
  {
    "session_id": "sess_b27de914aa61",
    "short_id": "CUST-4472",
    "customer_email": "daniel.cho.nyc@outlook.com",
    "handoff_active": false,
    "handled_by": null,
    "resolved": true,
    "reopen_count": 0,
    "sentiment": "neutral",
    "language": "en",
    "sector": "e-commerce",
    "start_minutes_ago": 495,
    "order": {
      "order_id": "WR-88402",
      "status": "Delivered",
      "carrier": "UPS",
      "eta": "Delivered",
      "tracking_url": "https://www.ups.com/track"
    },
    "messages": [
      {
        "id": "a65ed389",
        "sender": "human",
        "content": "Hey there! I just got my Urban Walkers from order #WR-88402.",
        "offset_sec": 90
      },
      {
        "id": "8b8148f6",
        "sender": "human",
        "content": "![Image](images/chat-demo-shoes.jpg)",
        "offset_sec": 179
      },
      {
        "id": "386ecbe0",
        "sender": "ai",
        "content": "Hi Daniel! We hope you love your new Urban Walkers. How can I assist you today?",
        "offset_sec": 250
      },
      {
        "id": "96da1dac",
        "sender": "human",
        "content": "I have somewhat wide feet and they feel a little too snug through the midfoot. Should I exchange for a wider fit?",
        "offset_sec": 323
      },
      {
        "id": "cf36d58b",
        "sender": "ai",
        "content": "The Urban Walkers run true to size for most people, but if they're snug through the midfoot, we do offer a Wide (W) width in the same size at no extra cost. I can start that exchange for you right now.",
        "offset_sec": 385
      },
      {
        "id": "c241330b",
        "sender": "human",
        "content": "That would be great, yes please.",
        "offset_sec": 430
      },
      {
        "id": "b2b9437a",
        "sender": "ai",
        "content": "Done! Since order #WR-88402 was delivered only 2 days ago, you're well within our 30-day exchange window. I've emailed you a prepaid return label — just drop the original pair off at any carrier location.",
        "offset_sec": 485
      },
      {
        "id": "571aa876",
        "sender": "human",
        "content": "Awesome, thank you. While I have you — what's the upper made of? They look amazing in person.",
        "offset_sec": 557
      },
      {
        "id": "27cd8130",
        "sender": "ai",
        "content": "Thank you! The upper is a blend of premium vegan suede and a breathable recycled mesh panel, so they stay light without sacrificing durability.",
        "offset_sec": 619
      },
      {
        "id": "f50bea63",
        "sender": "human",
        "content": "Nice, very sustainable. Do you sell the matching insoles I saw on the product page?",
        "offset_sec": 677
      },
      {
        "id": "562b0f79",
        "sender": "ai",
        "content": "We do — the Comfort+ Memory Foam insoles are $14 and drop right into the Urban Walkers. Want me to add a pair to your exchange order at no extra shipping cost?",
        "offset_sec": 770
      },
      {
        "id": "17be3111",
        "sender": "human",
        "content": "Sure, throw those in too!",
        "offset_sec": 821
      },
      {
        "id": "18c26797",
        "sender": "ai",
        "content": "Added! You'll receive the Wide-width Urban Walkers with the Comfort+ insoles already inside as soon as we scan your returned pair. Thanks for your patience, Daniel!",
        "offset_sec": 890
      },
      {
        "id": "d8f56413",
        "sender": "human",
        "content": "Perfect, appreciate the quick help.",
        "offset_sec": 957
      },
      {
        "id": "9a8dca03",
        "sender": "ai",
        "content": "Anytime! Have a great rest of your day.",
        "offset_sec": 1024
      }
    ],
    "customer_name": "Daniel Cho"
  },
  {
    "session_id": "sess_c839f2a7d150",
    "short_id": "CUST-4473",
    "customer_email": "priya.nair91@yahoo.com",
    "handoff_active": false,
    "handled_by": null,
    "resolved": true,
    "reopen_count": 0,
    "sentiment": "neutral",
    "language": "en",
    "sector": "e-commerce",
    "start_minutes_ago": 460,
    "order": {
      "order_id": "WR-88403",
      "status": "Delivered — Incorrect Item",
      "carrier": "FedEx",
      "eta": "Replacement overnight",
      "tracking_url": "https://www.fedex.com/track"
    },
    "messages": [
      {
        "id": "ce9ff57f",
        "sender": "human",
        "content": "Hi, I have a big problem with my order #WR-88403.",
        "offset_sec": 61
      },
      {
        "id": "bacfb3d0",
        "sender": "ai",
        "content": "Hello! I'm sorry to hear that. I can see order #WR-88403 for the Classic Silver Chronograph was marked delivered today. What seems to be the issue?",
        "offset_sec": 108
      },
      {
        "id": "89463e85",
        "sender": "human",
        "content": "I opened the package and there's no watch inside. Instead I got a bag of coffee beans???",
        "offset_sec": 182
      },
      {
        "id": "f91e1d4c",
        "sender": "human",
        "content": "![Image](images/chat-demo-coffee.jpg)",
        "offset_sec": 234
      },
      {
        "id": "142c3fe8",
        "sender": "ai",
        "content": "Oh no, that is definitely not a watch! I sincerely apologize for this mix-up at our fulfillment center — this looks like a packing/labeling error on our end. Let me get this fixed for you immediately.",
        "offset_sec": 303
      },
      {
        "id": "4b0dbb41",
        "sender": "human",
        "content": "Do I need to ship the coffee back to you guys? Honestly it smells amazing.",
        "offset_sec": 383
      },
      {
        "id": "9e574f7a",
        "sender": "ai",
        "content": "No need to return it — please keep the coffee as our apology for the mix-up! I'm expediting a replacement Classic Silver Chronograph to you right now via overnight shipping at no extra cost, and I've flagged this order for a fulfillment audit so it doesn't happen again.",
        "offset_sec": 468
      },
      {
        "id": "93cd59bf",
        "sender": "human",
        "content": "Wow, that's really generous, thank you! When will the replacement arrive?",
        "offset_sec": 536
      },
      {
        "id": "b45ed1f0",
        "sender": "ai",
        "content": "It'll ship within the hour and should reach you by tomorrow evening at the latest — I'll text you the new tracking number as soon as it's generated. Order #WR-88403 has been updated in our system to reflect the replacement shipment.",
        "offset_sec": 593
      },
      {
        "id": "0bbb2599",
        "sender": "human",
        "content": "Perfect. Is there anything I need to do on my end, like a return authorization for the coffee delivery?",
        "offset_sec": 642
      },
      {
        "id": "3a578a8e",
        "sender": "ai",
        "content": "Nope, nothing needed — it's yours to keep, no return authorization required. I've also added a $15 credit to your account for the inconvenience, which you can use on your next order.",
        "offset_sec": 729
      },
      {
        "id": "4a15544d",
        "sender": "human",
        "content": "That's so kind, thank you for handling this so quickly and painlessly!",
        "offset_sec": 823
      },
      {
        "id": "daf61a26",
        "sender": "ai",
        "content": "Of course, Priya — that's exactly what we're here for. Enjoy the coffee (and the watch, once it arrives)!",
        "offset_sec": 873
      }
    ],
    "customer_name": "Priya Nair"
  },
  {
    "session_id": "sess_d4a15e903c72",
    "short_id": "CUST-4474",
    "customer_email": "marcus.bell.fit@gmail.com",
    "handoff_active": false,
    "handled_by": null,
    "resolved": true,
    "reopen_count": 0,
    "sentiment": "neutral",
    "language": "en",
    "sector": "e-commerce",
    "start_minutes_ago": 420,
    "order": {
      "order_id": "WR-88404",
      "status": "Delivered",
      "carrier": "UPS",
      "eta": "Delivered",
      "tracking_url": "https://www.ups.com/track"
    },
    "messages": [
      {
        "id": "ddd1dfb2",
        "sender": "human",
        "content": "Hi, I need help with my Pulse Series smartwatch from order #WR-88404. It's easier if I just explain by voice, one sec.",
        "offset_sec": 59
      },
      {
        "id": "614ff3d7",
        "sender": "human",
        "content": "__AUDIO__",
        "offset_sec": 110
      },
      {
        "id": "7412b293",
        "sender": "ai",
        "content": "Thanks for sending that over, Marcus — I've reviewed your voice message. Just to confirm: you dropped the watch yesterday and now hear a rattling sound when you shake it gently, is that right?",
        "offset_sec": 172
      },
      {
        "id": "d58842de",
        "sender": "human",
        "content": "Exactly right, yeah. It still turns on and tracks fine, but that rattle is worrying me.",
        "offset_sec": 257
      },
      {
        "id": "29a3b2e9",
        "sender": "ai",
        "content": "That's usually the internal vibration motor housing coming loose from an impact — it doesn't affect water resistance or core function, but it should be repaired so it doesn't get worse. Good news: order #WR-88404 is still well within its 1-year warranty, and accidental drops during normal use are covered under our first-year protection plan.",
        "offset_sec": 325
      },
      {
        "id": "5af30553",
        "sender": "human",
        "content": "Oh that's a relief. What do I need to do?",
        "offset_sec": 393
      },
      {
        "id": "ab9099a4",
        "sender": "ai",
        "content": "I've generated a prepaid shipping label to our repair center — you'll get it by email in the next few minutes. Once we receive the watch, turnaround is typically 5-7 business days, and I can send a loaner Pulse Series in the meantime if you'd like one.",
        "offset_sec": 451
      },
      {
        "id": "b3aa7efe",
        "sender": "human",
        "content": "Yes please, I use it for workout tracking daily.",
        "offset_sec": 513
      },
      {
        "id": "a5e5a5ab",
        "sender": "ai",
        "content": "Done — a loaner unit ships out today and should arrive before your original watch even reaches our repair center. You won't miss a single workout.",
        "offset_sec": 601
      },
      {
        "id": "9bf00273",
        "sender": "human",
        "content": "That's fantastic service, thank you so much!",
        "offset_sec": 650
      },
      {
        "id": "2bcfbe01",
        "sender": "ai",
        "content": "Happy to help, Marcus! We'll keep you updated by email at every step of the repair.",
        "offset_sec": 735
      }
    ],
    "customer_name": "Marcus Bell",
    "audio_file": "voice-note-marcus.mp3"
  },
  {
    "session_id": "sess_e58b6f114d93",
    "short_id": "CUST-4475",
    "customer_email": "farhana.akter90@hotmail.com",
    "handoff_active": false,
    "handled_by": null,
    "resolved": true,
    "reopen_count": 0,
    "sentiment": "frustrated",
    "language": "en",
    "sector": "e-commerce",
    "start_minutes_ago": 385,
    "order": {
      "order_id": "WR-88405",
      "status": "Processing",
      "carrier": "FedEx",
      "eta": "Ships today — priority",
      "tracking_url": null
    },
    "messages": [
      {
        "id": "baa80dd4",
        "sender": "human",
        "content": "Hi! I need help with order #WR-88405, it's kind of urgent.",
        "offset_sec": 79
      },
      {
        "id": "29d4beef",
        "sender": "human",
        "content": "__AUDIO__",
        "offset_sec": 139
      },
      {
        "id": "6123fdf7",
        "sender": "ai",
        "content": "Thanks for the voice message, Farhana — I understand you ordered the men's Classic Oxford Shirt in size L as an Eid gift for your brother, but he actually wears a size M, and you're flying out to see him in two days. Let's get this sorted quickly.",
        "offset_sec": 213
      },
      {
        "id": "fd5166e6",
        "sender": "human",
        "content": "Yes exactly! Is there any way to fix the size before it ships?",
        "offset_sec": 275
      },
      {
        "id": "b02b61c4",
        "sender": "ai",
        "content": "Good news — order #WR-88405 hasn't shipped yet, it's still in our processing queue. I can swap the size to Medium right now at no charge, and I'll flag it for priority packing so it still goes out today.",
        "offset_sec": 360
      },
      {
        "id": "3838b326",
        "sender": "human",
        "content": "That would be amazing, please do that!",
        "offset_sec": 440
      },
      {
        "id": "5304317f",
        "sender": "ai",
        "content": "Done! Size updated to Medium and marked for priority handling. With expedited shipping, it should arrive at your address by tomorrow afternoon — well before your flight.",
        "offset_sec": 528
      },
      {
        "id": "c6a7ee39",
        "sender": "human",
        "content": "You're a lifesaver, seriously. Do I need to pay extra for the express shipping?",
        "offset_sec": 622
      },
      {
        "id": "3aa2e4f9",
        "sender": "ai",
        "content": "No extra charge — since this was a fix on our end, I've upgraded the shipping method for free. You'll get a new tracking link within the hour.",
        "offset_sec": 670
      },
      {
        "id": "ce177b4e",
        "sender": "human",
        "content": "Thank you so much, this made my day so much easier!",
        "offset_sec": 717
      },
      {
        "id": "66b2bc5b",
        "sender": "ai",
        "content": "Anytime, Farhana! I hope your brother loves the shirt, and safe travels.",
        "offset_sec": 782
      }
    ],
    "customer_name": "Farhana Akter",
    "audio_file": "voice-note-farhana.mp3"
  },
  {
    "session_id": "sess_f61c7a225e04",
    "short_id": "CUST-4476",
    "customer_email": "customer-7734K@shop.com",
    "handoff_active": false,
    "handled_by": null,
    "resolved": true,
    "reopen_count": 0,
    "sentiment": "neutral",
    "language": "es",
    "sector": "e-commerce",
    "start_minutes_ago": 340,
    "order": null,
    "messages": [
      {
        "id": "10f1bc81",
        "sender": "human",
        "content": "Hola, ¿ustedes envían pedidos a Canadá?",
        "offset_sec": 62
      },
      {
        "id": "e9c349e0",
        "sender": "ai",
        "content": "¡Hola! Sí, hacemos envíos a Canadá. El envío estándar tarda entre 7 y 10 días hábiles, y también ofrecemos envío exprés de 3 días por un costo adicional.",
        "offset_sec": 120
      },
      {
        "id": "e059a0ee",
        "sender": "human",
        "content": "Perfecto. ¿Y si el producto no me queda bien, puedo devolverlo desde allá?",
        "offset_sec": 201
      },
      {
        "id": "508ebad7",
        "sender": "ai",
        "content": "Por supuesto. Tienes 30 días desde la entrega para solicitar una devolución o cambio, sin importar el país. Te enviamos una etiqueta de devolución prepagada por correo apenas la solicites.",
        "offset_sec": 291
      },
      {
        "id": "a7cad415",
        "sender": "human",
        "content": "Genial. ¿El costo de la devolución lo cubren ustedes o lo tengo que pagar yo?",
        "offset_sec": 349
      },
      {
        "id": "654821d0",
        "sender": "ai",
        "content": "Cubrimos el costo de la etiqueta para cambios de talla o color. Si simplemente cambias de opinión sobre la compra, se descuenta una tarifa pequeña de $6 del reembolso.",
        "offset_sec": 425
      },
      {
        "id": "757750a9",
        "sender": "human",
        "content": "Entendido, muchas gracias por la info tan clara.",
        "offset_sec": 511
      },
      {
        "id": "43cf2fde",
        "sender": "ai",
        "content": "¡Con gusto! Si tienes más preguntas antes de comprar, aquí estoy para ayudarte.",
        "offset_sec": 565
      }
    ]
  },
  {
    "session_id": "sess_071de83fa256",
    "short_id": "CUST-4477",
    "customer_email": "j.whitfield@icloud.com",
    "handoff_active": false,
    "handled_by": null,
    "resolved": true,
    "reopen_count": 0,
    "sentiment": "neutral",
    "language": "en",
    "sector": "e-commerce",
    "start_minutes_ago": 300,
    "order": {
      "order_id": "WR-88406",
      "status": "Delivered",
      "carrier": "USPS",
      "eta": "Delivered",
      "tracking_url": "https://www.usps.com/track"
    },
    "messages": [
      {
        "id": "3f22faf8",
        "sender": "human",
        "content": "Hi! I bought the Urban Walkers a few weeks ago in order #WR-88406 and I love them.",
        "offset_sec": 53
      },
      {
        "id": "8fb5d27b",
        "sender": "ai",
        "content": "Hello James! We love hearing that — the Urban Walkers are definitely a fan favorite. What can I do for you today?",
        "offset_sec": 145
      },
      {
        "id": "434308bc",
        "sender": "human",
        "content": "I got caught in the rain yesterday and now they're pretty dirty and a bit stiff. How do I clean them without ruining the suede?",
        "offset_sec": 224
      },
      {
        "id": "95a76d79",
        "sender": "ai",
        "content": "Ah, the classic rain puddle! Since the upper is vegan suede, the most important thing is to let them dry completely and naturally first — don't use a hairdryer or put them near a radiator, direct heat can crack the material.",
        "offset_sec": 316
      },
      {
        "id": "e5d7b875",
        "sender": "human",
        "content": "Okay, they're fully dry now. What's next?",
        "offset_sec": 388
      },
      {
        "id": "663f1c97",
        "sender": "ai",
        "content": "Use a dry suede brush or a suede eraser in gentle, consistent strokes to lift the dried dirt and restore the nap. For stubborn marks, a very lightly damp microfiber cloth with a drop of mild soap works, then let it air-dry again.",
        "offset_sec": 470
      },
      {
        "id": "382567b8",
        "sender": "human",
        "content": "Can I just toss them in the washing machine on a gentle cycle to save time?",
        "offset_sec": 538
      },
      {
        "id": "827050a8",
        "sender": "ai",
        "content": "I'd strongly advise against that — the heat, tumbling, and detergent residue can weaken the adhesives holding the sole and distort the shape permanently. Hand cleaning really is worth the extra few minutes.",
        "offset_sec": 591
      },
      {
        "id": "1745d6d8",
        "sender": "human",
        "content": "Noted, thanks for the warning! Will the stiffness go away?",
        "offset_sec": 667
      },
      {
        "id": "0c0fd195",
        "sender": "ai",
        "content": "It should loosen up naturally after a few wears once fully dry. If it's still stiff after that, flexing them gently by hand or using a suede conditioning spray will help soften the material back up.",
        "offset_sec": 760
      },
      {
        "id": "27209bdf",
        "sender": "human",
        "content": "Good thing I asked before ruining them! I'll try the eraser method today.",
        "offset_sec": 812
      },
      {
        "id": "28f49481",
        "sender": "ai",
        "content": "Smart move. By the way, we also sell a suede care kit with the eraser, brush, and protector spray bundled together for $18, in case you want to keep them looking fresh long-term.",
        "offset_sec": 897
      },
      {
        "id": "ae340454",
        "sender": "human",
        "content": "Actually yeah, go ahead and add that to a new order, I'll check out separately.",
        "offset_sec": 992
      },
      {
        "id": "98ae4334",
        "sender": "ai",
        "content": "Perfect, I've added the Suede Care Kit to your cart — you'll find it ready to check out on our site. Enjoy your Urban Walkers, James!",
        "offset_sec": 1064
      }
    ],
    "customer_name": "James Whitfield"
  },
  {
    "session_id": "sess_18ef942bb371",
    "short_id": "CUST-4478",
    "customer_email": "emily.zhao@gmail.com",
    "handoff_active": false,
    "handled_by": null,
    "resolved": true,
    "reopen_count": 0,
    "sentiment": "happy",
    "language": "en",
    "sector": "e-commerce",
    "start_minutes_ago": 255,
    "order": {
      "order_id": "WR-88407",
      "status": "Processing",
      "carrier": "FedEx",
      "eta": "2 Days",
      "tracking_url": null
    },
    "messages": [
      {
        "id": "62801c45",
        "sender": "human",
        "content": "Hi! I have a question about my pending order #WR-88407.",
        "offset_sec": 49
      },
      {
        "id": "988c24c9",
        "sender": "ai",
        "content": "Hi Emily! Happy to help — I can see order #WR-88407 is still in processing and hasn't shipped yet. What did you need?",
        "offset_sec": 118
      },
      {
        "id": "877409a9",
        "sender": "human",
        "content": "It's a birthday gift for my sister. Can you add gift wrapping before it ships?",
        "offset_sec": 192
      },
      {
        "id": "f89897b9",
        "sender": "ai",
        "content": "Since the order hasn't shipped yet, I can definitely add that for you. Gift wrapping is an additional $5 — shall I charge the card on file?",
        "offset_sec": 253
      },
      {
        "id": "dc5c0eed",
        "sender": "human",
        "content": "Yes, please do. Will the price/invoice be hidden from the package?",
        "offset_sec": 333
      },
      {
        "id": "ae270da7",
        "sender": "ai",
        "content": "Absolutely. We'll wrap the items in our premium gift paper with a ribbon, and I'll remove the pricing invoice from the box entirely — only a gift note will be included.",
        "offset_sec": 378
      },
      {
        "id": "1d53434b",
        "sender": "human",
        "content": "That's perfect. Can I also include a custom birthday message?",
        "offset_sec": 469
      },
      {
        "id": "e2817efd",
        "sender": "ai",
        "content": "Of course! Just type your message here and I'll make sure it's handwritten on a premium card and included in the package.",
        "offset_sec": 557
      },
      {
        "id": "c0398710",
        "sender": "human",
        "content": "Tell her: 'Happy Birthday! Enjoy the best coffee in town. Love, Sarah.'",
        "offset_sec": 636
      },
      {
        "id": "c4c2e2e3",
        "sender": "ai",
        "content": "Got it! Your message and gift wrapping have been added to order #WR-88407 — I've noted it should read 'Love, Sarah' even though the account name is Emily, so our packing team won't second-guess it.",
        "offset_sec": 698
      },
      {
        "id": "5715bd6f",
        "sender": "human",
        "content": "Ha, good catch, thank you! One last thing — can I get it delivered on the exact birthday date, the 24th?",
        "offset_sec": 784
      },
      {
        "id": "4b22d308",
        "sender": "ai",
        "content": "I can flag it for scheduled delivery on the 24th — our carrier partner supports date-specific delivery for an extra $3. Want me to apply that too?",
        "offset_sec": 836
      },
      {
        "id": "287d06ca",
        "sender": "human",
        "content": "Yes, let's do it, worth it for the timing.",
        "offset_sec": 908
      },
      {
        "id": "00d4af59",
        "sender": "ai",
        "content": "All set! Order #WR-88407 is now gift-wrapped, carries your custom card, and is scheduled to arrive exactly on the 24th. Happy early birthday to your sister!",
        "offset_sec": 982
      }
    ],
    "customer_name": "Emily Zhao"
  },
  {
    "session_id": "sess_29fa053cc482",
    "short_id": "CUST-4479",
    "customer_email": "william.osei@outlook.com",
    "handoff_active": false,
    "handled_by": null,
    "resolved": true,
    "reopen_count": 0,
    "sentiment": "happy",
    "language": "en",
    "sector": "e-commerce",
    "start_minutes_ago": 210,
    "order": {
      "order_id": "WR-88408",
      "status": "Processing",
      "carrier": null,
      "eta": null,
      "tracking_url": null
    },
    "messages": [
      {
        "id": "e037e5ed",
        "sender": "human",
        "content": "URGENT! I just placed order #WR-88408 but I used my old apartment address!",
        "offset_sec": 91
      },
      {
        "id": "436d76e2",
        "sender": "ai",
        "content": "Hi William, don't panic, I can help with this. Let me pull up order #WR-88408 right now.",
        "offset_sec": 182
      },
      {
        "id": "c30ff46e",
        "sender": "human",
        "content": "It's for the 3-pack of essential tees.",
        "offset_sec": 259
      },
      {
        "id": "81f76d1c",
        "sender": "ai",
        "content": "I see it. Since you placed the order just 6 minutes ago, it hasn't been picked up by our warehouse yet, so we can still update it. What's the correct new address?",
        "offset_sec": 315
      },
      {
        "id": "deda4e16",
        "sender": "human",
        "content": "Thank goodness. New address is 123 Pine St, Apt 4B, Seattle, WA 98101.",
        "offset_sec": 366
      },
      {
        "id": "4c66e0a8",
        "sender": "ai",
        "content": "Updating that now... done! Order #WR-88408 will now ship to your new Seattle address.",
        "offset_sec": 451
      },
      {
        "id": "81f631d4",
        "sender": "human",
        "content": "Phew, you're a lifesaver. Will the tracking email still work correctly?",
        "offset_sec": 536
      },
      {
        "id": "32ebd689",
        "sender": "ai",
        "content": "Yes, you'll get the same tracking email as normal, and the destination shown will reflect the corrected address.",
        "offset_sec": 619
      },
      {
        "id": "5fb8d16c",
        "sender": "human",
        "content": "One more worry — will this delay the shipping at all?",
        "offset_sec": 673
      },
      {
        "id": "295b4715",
        "sender": "ai",
        "content": "No delay at all — the correction was made before the warehouse pulled the order for packing, so it stays on the original timeline. You should still have it within 3-4 business days.",
        "offset_sec": 766
      },
      {
        "id": "f4188f3f",
        "sender": "human",
        "content": "Thank you so much for fixing this so fast!",
        "offset_sec": 845
      },
      {
        "id": "ec24a3c5",
        "sender": "ai",
        "content": "Happy to help, William! Have a great time settling into the new apartment.",
        "offset_sec": 939
      }
    ],
    "customer_name": "William Osei"
  },
  {
    "session_id": "sess_3a0b164dd593",
    "short_id": "CUST-4480",
    "customer_email": "customer-2290L@shop.com",
    "handoff_active": false,
    "handled_by": null,
    "resolved": true,
    "reopen_count": 0,
    "sentiment": "neutral",
    "language": "en",
    "sector": "e-commerce",
    "start_minutes_ago": 175,
    "order": null,
    "messages": [
      {
        "id": "eb2263dd",
        "sender": "human",
        "content": "Hi, quick question before I buy — do your leather bags come with any kind of warranty?",
        "offset_sec": 78
      },
      {
        "id": "99546eb4",
        "sender": "ai",
        "content": "Hi there! Yes, all our leather goods including bags come with a 1-year warranty covering stitching defects, hardware failure, and material flaws under normal use.",
        "offset_sec": 123
      },
      {
        "id": "7d154385",
        "sender": "human",
        "content": "Does that cover the leather cracking or fading over time?",
        "offset_sec": 188
      },
      {
        "id": "1ca35cfb",
        "sender": "ai",
        "content": "Natural fading and minor patina from sun exposure is considered normal aging and isn't covered, but any premature cracking due to a material defect within the first year would be. We also sell a leather conditioner to help slow down natural wear if you want extra protection.",
        "offset_sec": 234
      },
      {
        "id": "e0f3eab0",
        "sender": "human",
        "content": "Good to know. What if I'm not happy with the color once I see it in person?",
        "offset_sec": 302
      },
      {
        "id": "3d4cbf37",
        "sender": "ai",
        "content": "You'd have our standard 30-day return window to exchange for a different color or get a full refund, as long as it's unused with tags attached.",
        "offset_sec": 366
      },
      {
        "id": "3da9c2a9",
        "sender": "human",
        "content": "Perfect, that answers everything, thanks!",
        "offset_sec": 414
      },
      {
        "id": "f26b4776",
        "sender": "ai",
        "content": "You're welcome! Let me know if you have any other questions before checking out.",
        "offset_sec": 495
      }
    ]
  },
  {
    "session_id": "sess_4b1c275ee6a4",
    "short_id": "CUST-4481",
    "customer_email": "aliza.rahman@gmail.com",
    "handoff_active": false,
    "handled_by": "Alex",
    "resolved": true,
    "reopen_count": 0,
    "sentiment": "frustrated",
    "language": "en",
    "sector": "e-commerce",
    "start_minutes_ago": 140,
    "order": {
      "order_id": "WR-88409",
      "status": "Delivered",
      "carrier": "UPS",
      "eta": "Delivered",
      "tracking_url": "https://www.ups.com/track"
    },
    "messages": [
      {
        "id": "15ed6269",
        "sender": "human",
        "content": "I just checked my bank statement and I've been charged TWICE for order #WR-88409. This looks like fraud, I need this fixed right now.",
        "offset_sec": 50
      },
      {
        "id": "7c69dee1",
        "sender": "ai",
        "content": "I completely understand the concern, Aliza — let me look into order #WR-88409 immediately.",
        "offset_sec": 141
      },
      {
        "id": "fa5d3100",
        "sender": "human",
        "content": "This is really stressful, I don't have extra money sitting around for a duplicate charge.",
        "offset_sec": 190
      },
      {
        "id": "885f6e66",
        "sender": "ai",
        "content": "I hear you, and I'm treating this as urgent. I can see two authorization entries on the order from the same day, which does look unusual. Since this involves your bank account directly, I want a specialist to verify this precisely rather than guess — connecting you with a human agent now who can pull the full payment gateway logs.",
        "offset_sec": 283
      },
      {
        "id": "2031d750",
        "sender": "agent_internal",
        "content": "Pulling up the payment gateway logs for WR-88409... one is a real charge and the other is a pending authorization hold from a retried webhook, not a second charge. Releasing the hold manually.",
        "offset_sec": 377
      },
      {
        "id": "a8e56e0c",
        "sender": "agent",
        "content": "Hi Aliza, this is Alex from the billing team. Good news — you were only actually charged once. The second entry was a temporary authorization hold caused by a retry on our payment processor's end, not a real charge. I've manually released that hold right now.",
        "offset_sec": 430
      },
      {
        "id": "f264accc",
        "sender": "human",
        "content": "Oh thank god. How long until that hold disappears from my statement?",
        "offset_sec": 505
      },
      {
        "id": "2a45c2ab",
        "sender": "agent",
        "content": "Most banks clear released holds within 24-48 hours, though it can occasionally take up to 5 business days depending on your bank's own processing schedule. I've also emailed you a confirmation letter you can show your bank if it takes longer than expected.",
        "offset_sec": 585
      },
      {
        "id": "8715a103",
        "sender": "human",
        "content": "That's incredibly helpful, thank you for actually digging into this instead of just brushing me off.",
        "offset_sec": 646
      },
      {
        "id": "6c52c49f",
        "sender": "agent",
        "content": "Of course — a duplicate charge scare is genuinely stressful, glad we could clear it up fast. I've also added a note to your account so if this ever happens again, it gets escalated to me directly.",
        "offset_sec": 729
      },
      {
        "id": "edcd465e",
        "sender": "human",
        "content": "I really appreciate that, Alex. Thank you!",
        "offset_sec": 787
      },
      {
        "id": "c1590f53",
        "sender": "agent",
        "content": "Anytime, Aliza. Have a great rest of your day!",
        "offset_sec": 866
      }
    ],
    "customer_name": "Aliza Rahman",
    "handoff_summary": "Customer reports being charged twice for order #WR-88409 and suspects fraud — needs payment gateway investigation."
  },
  {
    "session_id": "sess_5c2d386ff7b5",
    "short_id": "CUST-4482",
    "customer_email": "grace.whitman@aol.com",
    "handoff_active": false,
    "handled_by": "Harry",
    "resolved": true,
    "reopen_count": 0,
    "sentiment": "angry",
    "language": "en",
    "sector": "e-commerce",
    "start_minutes_ago": 100,
    "order": {
      "order_id": "WR-88410",
      "status": "Delivered — Damaged",
      "carrier": "FedEx",
      "eta": "Replacement overnight",
      "tracking_url": "https://www.fedex.com/track"
    },
    "messages": [
      {
        "id": "b09b2a5c",
        "sender": "human",
        "content": "I just opened my order #WR-88410 and the watch face is CRACKED. This was a $1,200 anniversary gift for my husband and it's ruined.",
        "offset_sec": 91
      },
      {
        "id": "b683d2e6",
        "sender": "ai",
        "content": "I'm so sorry to hear that, Grace — a cracked crystal on a $1,200 piece straight out of the box is completely unacceptable. Let me pull up order #WR-88410 right away.",
        "offset_sec": 148
      },
      {
        "id": "66245bfa",
        "sender": "human",
        "content": "I need this fixed before our anniversary dinner tomorrow night. Can you actually make that happen?",
        "offset_sec": 212
      },
      {
        "id": "a65e688e",
        "sender": "ai",
        "content": "Given the value and the timeline, I want this to get the fastest possible resolution with full authority to expedite — connecting you with a senior agent right now who can approve an overnight replacement immediately.",
        "offset_sec": 299
      },
      {
        "id": "702753a1",
        "sender": "agent_internal",
        "content": "Checking warehouse stock for this SKU... one unit available at our NYC facility, close enough for guaranteed overnight. Approving replacement and waiving the standard damage-claim photo review since the timeline is critical.",
        "offset_sec": 367
      },
      {
        "id": "7394988f",
        "sender": "agent",
        "content": "Hi Grace, this is Harry — I've personally approved an overnight replacement, no photo review needed given your timeline. It ships within the hour from our NYC facility and is guaranteed to arrive before 10:30 AM tomorrow.",
        "offset_sec": 445
      },
      {
        "id": "3f76be1d",
        "sender": "human",
        "content": "Thank you, that's a huge relief. What happens with the damaged one?",
        "offset_sec": 497
      },
      {
        "id": "1064005c",
        "sender": "agent",
        "content": "No need to ship it back — keep it or dispose of it as you like. I've also applied a $75 credit to your account for the stress this caused on such an important occasion.",
        "offset_sec": 556
      },
      {
        "id": "05628059",
        "sender": "human",
        "content": "That's really thoughtful, thank you for actually treating this like it mattered.",
        "offset_sec": 622
      },
      {
        "id": "8dcdcd03",
        "sender": "agent",
        "content": "It absolutely mattered — anniversaries don't come with do-overs. You'll get tracking details within the next 30 minutes.",
        "offset_sec": 704
      },
      {
        "id": "96a402f2",
        "sender": "human",
        "content": "Perfect, thank you so much Harry, you've saved our anniversary.",
        "offset_sec": 763
      },
      {
        "id": "01d74256",
        "sender": "agent",
        "content": "Happy to help, Grace. Congratulations, and enjoy the dinner!",
        "offset_sec": 822
      }
    ],
    "customer_name": "Grace Whitman",
    "handoff_summary": "High-value item ($1,200 designer watch) arrived damaged; customer needs a replacement before an anniversary dinner tomorrow."
  },
  {
    "session_id": "sess_6d3e497008c6",
    "short_id": "CUST-4483",
    "customer_email": "robert.klein@verizon.net",
    "handoff_active": false,
    "handled_by": "Issac",
    "resolved": true,
    "reopen_count": 1,
    "sentiment": "angry",
    "language": "en",
    "sector": "e-commerce",
    "start_minutes_ago": 60,
    "order": {
      "order_id": "WR-88411",
      "status": "In Transit — Delayed",
      "carrier": "UPS",
      "eta": "Emergency same-day replacement dispatched",
      "tracking_url": "https://www.ups.com/track"
    },
    "messages": [
      {
        "id": "b535106e",
        "sender": "human",
        "content": "I'm a Platinum member and my order #WR-88411 has been stuck on 'In Transit' for 9 days. It's my daughter's birthday gift and her birthday is TOMORROW.",
        "offset_sec": 49
      },
      {
        "id": "0f1259e0",
        "sender": "ai",
        "content": "I'm really sorry, Robert — 9 days stuck in transit is well outside our normal delivery window, and I understand the timing pressure with your daughter's birthday tomorrow. Let me check order #WR-88411.",
        "offset_sec": 134
      },
      {
        "id": "114125c6",
        "sender": "human",
        "content": "I've already called the carrier twice and got nowhere. I'm about to cancel my membership over this.",
        "offset_sec": 193
      },
      {
        "id": "dc1110c1",
        "sender": "ai",
        "content": "That's completely fair frustration, and I don't want you to have to fight for this any further. Given your Platinum status and the deadline, I'm escalating this directly to our operations manager who can authorize an emergency solution rather than waiting on the carrier.",
        "offset_sec": 240
      },
      {
        "id": "1223b513",
        "sender": "agent_internal",
        "content": "This is a manager-level case — carrier tracking shows the package looping in a regional hub, likely lost. Authorizing an emergency same-day replacement shipment from our closest fulfillment center and comping the customer's next order given the Platinum tier and the missed-birthday risk.",
        "offset_sec": 306
      },
      {
        "id": "3ceddf2d",
        "sender": "agent",
        "content": "Hi Robert, this is Issac, operations manager. I've confirmed your original package is likely lost in the carrier's system, so rather than keep waiting, I've dispatched a same-day replacement from our Chicago warehouse with guaranteed delivery by 8 PM tonight.",
        "offset_sec": 383
      },
      {
        "id": "ab4220a7",
        "sender": "human",
        "content": "Tonight? That would actually save the whole birthday. Are you sure that's possible?",
        "offset_sec": 445
      },
      {
        "id": "36d8393a",
        "sender": "agent",
        "content": "Confirmed and booked — you'll get real-time tracking within the next 15 minutes. I've also credited your account for a free item on your next order, and I'm personally flagging your account so any future issue gets escalated straight to me.",
        "offset_sec": 521
      },
      {
        "id": "21df306f",
        "sender": "human",
        "content": "Issac, I genuinely can't thank you enough. This is the kind of service that keeps me a customer for life.",
        "offset_sec": 600
      },
      {
        "id": "ef7ddc76",
        "sender": "agent",
        "content": "That means a lot, Robert — and happy early birthday to your daughter. If the replacement doesn't arrive by 8 PM for any reason, message me directly and I'll have a courier there within the hour.",
        "offset_sec": 691
      },
      {
        "id": "93829b43",
        "sender": "human",
        "content": "Will do. Thank you again, truly.",
        "offset_sec": 772
      },
      {
        "id": "3e351128",
        "sender": "agent",
        "content": "Anytime. Enjoy the celebration tonight!",
        "offset_sec": 847
      }
    ],
    "customer_name": "Robert Klein",
    "handoff_summary": "Platinum member's order stuck in transit for 9 days; needed for daughter's birthday tomorrow — requesting emergency resolution."
  },
  {
    "session_id": "sess_7e4f5a8119d7",
    "short_id": "CUST-4484",
    "customer_email": "noah.fischer@proton.me",
    "handoff_active": false,
    "handled_by": null,
    "resolved": true,
    "reopen_count": 0,
    "sentiment": "neutral",
    "language": "en",
    "sector": "e-commerce",
    "start_minutes_ago": 35,
    "order": {
      "order_id": "WR-88412",
      "status": "Delivered",
      "carrier": "USPS",
      "eta": "Delivered",
      "tracking_url": "https://www.usps.com/track"
    },
    "messages": [
      {
        "id": "7914c120",
        "sender": "human",
        "content": "Hi, I bought the Merino Wool Crewneck in order #WR-88412 and wanted to ask about care instructions.",
        "offset_sec": 95
      },
      {
        "id": "30beb45f",
        "sender": "ai",
        "content": "Hi Noah! Great choice, the Merino Crewneck is one of our softest pieces. What would you like to know?",
        "offset_sec": 166
      },
      {
        "id": "18d0752b",
        "sender": "human",
        "content": "Is it machine washable or does it need dry cleaning?",
        "offset_sec": 217
      },
      {
        "id": "6e595ed3",
        "sender": "ai",
        "content": "It's machine washable on a cold, gentle cycle inside a mesh laundry bag, but we'd recommend air-drying flat rather than using a dryer — the heat can cause wool to shrink and lose its shape.",
        "offset_sec": 304
      },
      {
        "id": "6c6fa611",
        "sender": "human",
        "content": "Good to know. Will it pill over time like cheaper wool sweaters?",
        "offset_sec": 371
      },
      {
        "id": "778eedb3",
        "sender": "ai",
        "content": "Some light pilling is normal with any knit over months of wear, but our merino blend pills less than standard wool since it uses long-staple fibers. A fabric shaver handles any pilling in seconds if it happens.",
        "offset_sec": 442
      },
      {
        "id": "0dde29a6",
        "sender": "human",
        "content": "Makes sense. What percentage merino is it — I have mild wool sensitivity.",
        "offset_sec": 533
      },
      {
        "id": "a748dbcf",
        "sender": "ai",
        "content": "It's a 70% merino, 30% cashmere blend. Merino is one of the softest, least-irritating wools since the fibers are much finer than standard wool, but if you have a sensitivity, I'd suggest a light layer underneath just to be safe the first few times.",
        "offset_sec": 621
      },
      {
        "id": "1931e9ee",
        "sender": "human",
        "content": "That's helpful, thank you. Last question — if it does bother my skin, can I return it after wearing it once?",
        "offset_sec": 707
      },
      {
        "id": "6712303a",
        "sender": "ai",
        "content": "Yes — order #WR-88412 is covered under our 30-day return policy even if worn briefly for a fit or comfort check, as long as it's not visibly damaged or heavily used. Just keep the tags on hand.",
        "offset_sec": 755
      },
      {
        "id": "56dc8907",
        "sender": "human",
        "content": "Perfect, that's reassuring. Thanks for all the detail!",
        "offset_sec": 846
      },
      {
        "id": "3fa7f104",
        "sender": "ai",
        "content": "Anytime, Noah — hope it works out great for you.",
        "offset_sec": 897
      }
    ],
    "customer_name": "Noah Fischer"
  },
  {
    "session_id": "sess_8f5061922ee8",
    "short_id": "CUST-4485",
    "customer_email": "isabella.cruz@gmail.com",
    "handoff_active": false,
    "handled_by": null,
    "resolved": true,
    "reopen_count": 0,
    "sentiment": "happy",
    "language": "en",
    "sector": "e-commerce",
    "start_minutes_ago": 12,
    "order": {
      "order_id": "WR-88413",
      "status": "Processing",
      "carrier": "FedEx",
      "eta": "3 Days",
      "tracking_url": null
    },
    "messages": [
      {
        "id": "30b187ef",
        "sender": "human",
        "content": "Hi, I think I accidentally placed the same order twice — I see #WR-88413 and #WR-88414 in my order history, both with the same items.",
        "offset_sec": 57
      },
      {
        "id": "72d8567d",
        "sender": "ai",
        "content": "Let me check that for you, Isabella... you're right, I can see both order #WR-88413 and #WR-88414 were placed about 4 minutes apart with identical items. That does look like an accidental duplicate, probably from a double-click at checkout.",
        "offset_sec": 136
      },
      {
        "id": "6c006f61",
        "sender": "human",
        "content": "Yeah probably, I was on my phone with bad signal. Can you cancel one and refund me?",
        "offset_sec": 189
      },
      {
        "id": "474ebc19",
        "sender": "ai",
        "content": "Absolutely — since neither order has shipped yet, I'll cancel #WR-88414 and issue a full refund to your original payment method, keeping #WR-88413 active so your item still arrives on schedule.",
        "offset_sec": 245
      },
      {
        "id": "3ff350bf",
        "sender": "human",
        "content": "Perfect, thank you. How long will the refund take?",
        "offset_sec": 319
      },
      {
        "id": "71710434",
        "sender": "ai",
        "content": "You'll see the refund within 3-5 business days, depending on your bank. I'll also send a confirmation email once the cancellation is fully processed.",
        "offset_sec": 368
      },
      {
        "id": "19108be5",
        "sender": "human",
        "content": "Great. Is there any chance you could also throw in free shipping on #WR-88413 since this was a bit of a hassle?",
        "offset_sec": 448
      },
      {
        "id": "a6f2f7b8",
        "sender": "ai",
        "content": "That's a fair ask — I've removed the shipping charge from order #WR-88413 as a courtesy. You won't be charged for delivery on this one.",
        "offset_sec": 496
      },
      {
        "id": "d605e770",
        "sender": "human",
        "content": "Awesome, appreciate you being flexible. Thanks for sorting it out so quickly!",
        "offset_sec": 575
      },
      {
        "id": "f8102383",
        "sender": "ai",
        "content": "Anytime, Isabella! You'll get a summary email shortly confirming both the cancellation and the waived shipping.",
        "offset_sec": 620
      }
    ],
    "customer_name": "Isabella Cruz"
  }
];

(function hydrateDemoSessions() {
  const now = Date.now();

  function audioUrl(fileName) {
    try {
      return new URL('live-demo-assets/audio/' + fileName, window.location.href).href;
    } catch (e) {
      return 'live-demo-assets/audio/' + fileName;
    }
  }

  const hydrated = RAW_DEMO_SESSIONS.map((chat) => {
    const startMs = now - chat.start_minutes_ago * 60000;
    const audioSrc = chat.audio_file ? audioUrl(chat.audio_file) : null;

    let lastMs = startMs;
    const messages = chat.messages.map((m) => {
      lastMs = startMs + m.offset_sec * 1000;
      let content = m.content;
      if (content === '__AUDIO__' && audioSrc) {
        content = `[Audio](${audioSrc})`;
      }
      return {
        id: m.id,
        sender: m.sender,
        content: content,
        created_at: new Date(lastMs).toISOString()
      };
    });

    const chatCopy = Object.assign({}, chat);
    delete chatCopy.start_minutes_ago;
    delete chatCopy.audio_file;
    chatCopy.created_at = new Date(startMs).toISOString();
    chatCopy.updated_at = new Date(lastMs).toISOString();
    chatCopy.messages = messages;
    return chatCopy;
  });

  window.DEMO_CHATS = hydrated;
})();

// Kept for any code path that expects the old global name directly.
const mockDemoSessions = window.DEMO_CHATS;
