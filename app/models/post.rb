class Post < ApplicationRecord
  has_one_attached :file
  has_rich_text :content
end
