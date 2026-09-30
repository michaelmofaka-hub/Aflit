from pydantic import  BaseModel

class platform_credentials(BaseModel):
  user_id: str
  platform_name: str
  platform_id: str


