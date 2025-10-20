# LOCUS: Edge AI Driven Spatial Intelligence via Matter-based Federated Learning
---
## Proposal
This project proposes LOCUS, a service that enables smart appliances to locate users' lost items through image learning. This is achieved by integrating a Matter-protocol-enabled Federated Learning (FL) system and Edge AI to advance the spatial awareness capabilities of the smart home.

The system utilizes lightweight on-device AI models embedded in appliances like Robot Vacuum Cleaners (RVCs) to precisely recognize, learn, and determine the location of objects within the home. Each appliance learns and stores data regarding furniture and objects within its view in the form of lightweight feature vectors. When a user reports the features of a lost item, the appliances cooperatively check for the item's presence via Matter local communication, and the discovering appliance (or the one closest to the item) guides the user with a smart auditory/visual notification.

LOCUS achieves high recognition accuracy compared to single-device performance by utilizing custom Matter clusters to securely share model weight updates and object location metadata. This strategy eliminates cloud round-trip latency and leverages local communication to ensure an ultra-low-latency user experience (UX), while simultaneously maintaining data privacy and protection.

The goals of this research are to achieve scalability in interoperation and learning with other manufacturers' appliances using Matter clusters, security through weight-based learning, and reduction of Cloud Operation Expenditure (OpEx) through the lightweight nature of Edge AI implementation.

---
## Team Members

| Name | Organization | Email |
| :--- | :--- | :--- |
| Hanyeong Go | Department of Information Systems, Hanyang University | lilla9907@hanyang.ac.kr |
| Junhyung Kim | Department of Information Systems, Hanyang University | combe4259@hanyang.ac.kr |
| Dayeon Lee | Department of Sports Science, Hanyang University | ldy21@hanyang.ac.kr |
| Seunghwan Lee | Department of Information Systems, Hanyang University | shlee5820@hanyang.ac.kr |
