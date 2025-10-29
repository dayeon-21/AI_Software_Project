# LOCUS: AI-Driven Household Context-Awareness for Predictive Cleaning
---
## Proposal

###
This project is an Option B prototype to evolve robot vacuums from reactive tools into predictive partners. Our system, LOCUS, operates entirely on-device to guarantee user privacy while learning unique behavioral patterns that predict messes. LOCUS fuses multimodal sensor data: SLAM creates semantic maps ("kitchen"), YOLO identifies visual activities ("person eating"), and SED captures audio context ("cooking sounds"). This time-series data is fed into a lightweight GRU model, which serves as the system's brain. It learns sequential user patterns, enabling it to predict outcomes like "a mess is likely" based on the context flow. The core innovation is implementing Personalized Federated Learning (PFL), specifically using a FedPer architecture. The GRU model is split: a Base (feature extraction) is trained collectively via federated updates, learning general intelligence. A Head (decision layer) is trained only locally on the device. This allows LOCUS to leverage shared knowledge while ensuring the final decision-making is hyper-personalized to the user's specific habits. The final prototype will proactively predict and suggest optimal cleaning times rather than just reacting to commands.
---
## Team Members

| Name | Organization | Email |
| :--- | :--- | :--- |
| Hanyeong Go | Department of Information Systems, Hanyang University | lilla9907@hanyang.ac.kr |
| Junhyung Kim | Department of Information Systems, Hanyang University | combe4259@hanyang.ac.kr |
| Dayeon Lee | Department of Sports Science, Hanyang University | ldy21@hanyang.ac.kr |
| Seunghwan Lee | Department of Information Systems, Hanyang University | shlee5820@hanyang.ac.kr |
