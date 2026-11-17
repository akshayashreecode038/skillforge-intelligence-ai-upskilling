from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    target_role = Column(String)
    resume_text = Column(Text)


class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    skill_name = Column(String)
    current_level = Column(Float)
    required_level = Column(Float)


class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    skill_name = Column(String)
    topic = Column(String)

    status = Column(String, default="not_started")
    score = Column(Integer, default=0)