from pydantic import  BaseModel

class platform_credentials(BaseModel):
  platform_name: str
  platform_id: str
      