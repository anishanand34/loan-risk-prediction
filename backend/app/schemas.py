from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class LoanInput(BaseModel):
    income: float
    loan_amount: float

class LoanInput(BaseModel):
    user_id: int
    income: float
    loan_amount: float