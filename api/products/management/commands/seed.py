from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from products.models import Product

User = get_user_model()
image = "https://placehold.co/600x600/fdbd32/131445/png?text="
images = {
    "Air Zoom Runner": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRj2Rn3im6b8lWtOwckrseSK4ykb0VdVnFYjkTjSVQYS8bEhAhiyuoXZ3KT&s=10",
    "Desk Lamp LED": "https://isomarsshop.in/cdn/shop/files/isomars-led-desk-lamp-for-computer-monitor-laptop-24-inch-eye-friendly-usb-study-light-with-circular-base-flexible-gooseneck-3-color-modes-10-brightness-levels--3391958.png?v=1786733949&width=1500",
    "Classic Leather Sneaker": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuIEdzrYZ6hLCIKvNVNay-Tpq2afx9aV2CGpgYO5nGdeBodygfjmnqQjJI&s=10",
    "Insulated Steel Bottle":"https://m.media-amazon.com/images/I/71wFyZlg58L.jpg",
    "Adjustable Dumbbell Set": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt7YLEY9zP7UuHbNXVCHEBY7Pp5T0fLhfvm8JFEaOVCt1M9i4MK0k5Ys1d&s=10",
   "Ceramic Coffee Mug": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfuv0KhIfudw13jcFX4Jizbsu8yvZF42gm9VggOIDiEA&s=10",
   "Wireless Earbuds Pro": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYNPPUQJRPUvGXnvklKQO5LImRbmXjFHk2xekqWTNQuA&s=10",
   "Smart Fitness Band": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRC-X0xqz0Bj8s_IHeaN1LgB14B9dCyJpZWREpuvI8IWHvJDgMe6W-YyT7o&s=10"
}
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
        demo = {"email": "dipu@infilect.com", "first_name": "Dipu"}
        user, created = User.objects.get_or_create(username="dipu@infilect.com", defaults=demo)
        if created:
            user.set_password("dipu@123")
            user.save()
        for name, brand, category, text, price in items:
            data = {"brand": brand, "category": category, "description": text, "price": price}
            data["image_url"] = images.get(name) or image + name.replace(" ", "+")
            Product.objects.update_or_create(name=name, owner=user, defaults=data)
        self.stdout.write(f"seeded {len(items)} products, login dipu@infilect.com / dipu@123")
