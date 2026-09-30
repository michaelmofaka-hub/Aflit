from pydantic import BaseModel


class PlatformCredentials(BaseModel):
    platform_name: str
    platform_id: str


class PlatformResponse(BaseModel):
    platform_id: str
    platform_name: str
    status: str
  