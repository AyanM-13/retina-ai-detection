import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader

# ====== CONFIG ======
DATA_DIR = "dataset/diabetes"
BATCH_SIZE = 8
EPOCHS = 5
LR = 1e-4

# ====== TRANSFORM ======
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

# ====== DATASET ======
dataset = datasets.ImageFolder(DATA_DIR, transform=transform)
loader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)

print("Classes:", dataset.classes)
print("Images:", len(dataset))

# ====== MODEL ======
model = models.resnet18(weights="DEFAULT")
model.fc = nn.Linear(model.fc.in_features, 2)

# ====== TRAIN SETUP ======
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LR)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

# ====== TRAIN LOOP ======
for epoch in range(EPOCHS):
    total_loss = 0

    for imgs, labels in loader:
        imgs, labels = imgs.to(device), labels.to(device)

        outputs = model(imgs)
        loss = criterion(outputs, labels)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    print(f"Epoch {epoch+1}/{EPOCHS} Loss: {total_loss:.4f}")

# ====== SAVE MODEL ======
torch.save(model, "model_diabetes.pth")
print("Model saved: model_diabetes.pth")