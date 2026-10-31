from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class LoanInput(BaseModel):
    user_id: int
    income: float = Field(gt=0, description="Annual income")
    loan_amount: float = Field(gt=0)
    cibil_score: int = Field(ge=300, le=900)