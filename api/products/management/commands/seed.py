from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from products.models import Product

User = get_user_model()
image = "https://placehold.co/600x600/fdbd32/131445/png?text="
items = [
    ("Air Zoom Runner", "Nike", "shoes", "Lightweight running shoe with a breathable mesh upper and a cushioned sole.", "6499"),
    ("Classic Leather Sneaker", "Puma", "shoes", "Everyday white leather sneaker with a soft inner lining.", "3999"),
    ("Trail Backpack 30L", "Wildcraft", "bags", "Water resistant 30 litre backpack with padded straps and a laptop sleeve.", "2799"),
    ("Insulated Steel Bottle", "Milton", "kitchen", "One litre steel bottle that keeps drinks cold for 24 hours or hot for 12.", "799"),
    ("Ceramic Coffee Mug", "Borosil", "kitchen", "Microwave safe 350 ml ceramic mug with a matte finish.", "349"),
    ("Wireless Earbuds Pro", "boAt", "electronics", "Bluetooth earbuds with noise reduction and a 30 hour charging case.", "2499"),
    ("Smart Fitness Band", "Noise", "electronics", "Tracks steps, heart rate and sleep with a 10 day battery.", "1999"),
    ("Cotton Crew T-Shirt", "Levi's", "clothing", "Soft pure cotton t-shirt in a regular fit.", "899"),
    ("Slim Fit Denim Jeans", "Levi's", "clothing", "Stretch denim jeans with a slim fit and mid rise.", "2999"),
    ("Yoga Mat 6mm", "Decathlon", "fitness", "Non slip 6 mm yoga mat with a carry strap.", "1299"),
    ("Adjustable Dumbbell Set", "Cult", "fitness", "Pair of adjustable dumbbells, 2 to 10 kg per hand.", "3499"),
    ("Desk Lamp LED", "Philips", "home", "Dimmable LED desk lamp with three colour modes.", "1499"),
]


class Command(BaseCommand):
    help = "add a demo user and sample products"

    def handle(self, *args, **options):
        demo = {"email": "demo@example.com", "first_name": "Demo"}
        user, created = User.objects.get_or_create(username="demo@example.com", defaults=demo)
        if created:
            user.set_password("demo12345")
            user.save()
        added = []
        for name, brand, category, text, price in items:
            data = {"brand": brand, "category": category, "description": text, "price": price, "image_url": image + name.replace(" ", "+")}
            added.append(Product.objects.get_or_create(name=name, owner=user, defaults=data)[1])
        self.stdout.write(f"added {sum(added)} products, login demo@example.com / demo12345")
