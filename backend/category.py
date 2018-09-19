from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship, backref
from marshmallow import fields
import simplejson as simplejson
from .api import Base, ma

class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True)
    parent_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    children = relationship("Category", uselist=True)
    name = Column(String(250), nullable=False)
    bg = Column(String(16), nullable=True)
 
class CategorySchema(ma.Schema):
    class Meta:
        json_module = simplejson
        fields = ('id', 'parent_id', 'children', 'name', 'bg')

category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)