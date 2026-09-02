import sys
sys.path.insert(0, "d:/Whatsapp_Automachine/Backend")
from app.core.database import create_user_and_company, authenticate_user, list_all_users

print("--- 1. TESTING USER REGISTRATION IN NEON POSTGRESQL ---")
res, err = create_user_and_company(
    name="Vikram Sharma",
    email="vikram@techmasters.com",
    password="TestPassword@123",
    company_name="Academy of Tech Masters CRM",
    phone="+919988776655"
)

if err:
    print("Registration notice:", err)
else:
    print("SUCCESS: User created in Neon Database!")
    print("User ID:", res["user"]["id"])
    print("User Name:", res["user"]["name"])
    print("User Email:", res["user"]["email"])
    print("Company:", res["company"]["name"])
    print("Session Token:", res["token"][:25] + "...")

print("\n--- 2. TESTING USER LOGIN (AUTHENTICATION) ---")
auth_res, auth_err = authenticate_user("vikram@techmasters.com", "TestPassword@123")
if auth_err:
    print("Login Error:", auth_err)
else:
    print("SUCCESS: Logged in with Neon Database!")
    print("Authenticated User:", auth_res["user"]["name"])
    print("Associated Company:", auth_res["user"]["company_name"])

print("\n--- 3. ALL USERS STORED IN NEON POSTGRESQL ---")
users = list_all_users()
print(f"Total Users in Neon: {len(users)}")
for u in users:
    print(f"-> {u['name']} ({u['email']}) | Company: {u['company_name']} | Phone: {u['phone']}")
