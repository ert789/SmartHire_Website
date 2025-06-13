# backend/add_hr_user.py
from app import app, db, HRUser, bcrypt

with app.app_context():
    try:
        # Check if the HR user already exists
        existing_user = HRUser.query.filter_by(email='hr@example.com').first()
        if existing_user:
            db.session.delete(existing_user)
            db.session.commit()
            print("Existing HR user deleted.")
        
        # Create a hashed password for the HR user
        hashed_password = bcrypt.generate_password_hash('smarthire123').decode('utf-8')

        
        # Create an HR user
        hr_user = HRUser(name='HR Manager', email='smarthire120@gmail.com', password=hashed_password, logged_out=False)
        
        # Add and commit the user to the database
        db.session.add(hr_user)
        db.session.commit()
        print("HR user created!")
    except Exception as e:
        print(f"Error: {e}")
        db.session.rollback()  # Rollback in case of error to avoid partial commits
