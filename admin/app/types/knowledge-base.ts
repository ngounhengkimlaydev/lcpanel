export type ArticleStatus = 'published' | 'draft' | 'archived'
export type ArticleDifficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export type KnowledgeBaseArticle = {
  id: number
  title: string
  description: string
  category: string
  status: ArticleStatus
  difficulty: ArticleDifficulty
  tags: string[]
  views: number
  readTime: number
  featured: boolean
  icon: string
}

export type KnowledgeBaseForm = {
  title: string
  description: string
  category: string
  status: ArticleStatus
  difficulty: ArticleDifficulty
  readTime: number
  tags: string
}