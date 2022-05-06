```mermaid
flowchart TD
    B[Seq]
    B --> Hurt
    B --> A[Ctrl player in attack distance]
    A --True--> Attack
    A --False--> followPlayer

    B --> Strafe
```