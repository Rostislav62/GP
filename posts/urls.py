"""
/GuildPost/posts/urls.py
"""
from django.urls import path
from .views import categories_view, add_comment, delete_article
from . import views
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('categories/', categories_view, name='categories'),
    path("articles/", views.article_list_view, name="article_list"),  # Список статей
    path("articles/<int:pk>/", views.article_detail_view, name="article_detail"),  # Детальная страница статьи
    path("articles/<int:pk>/add-comment/", add_comment, name="add_comment"),  # Добавление комментария
    path("articles/<int:pk>/comments/", views.all_comments, name="all_comments"),  # Страница всех комментариев
    path('ads/create/', views.create_ad, name='create_ad'),  # Маршрут для создания объявления
    path('ads/<int:pk>/edit/', views.edit_ad, name='edit_ad'),  # Маршрут для редактирования объявления
    path('ads/preview/', views.preview_ad, name='preview_ad'),  # Маршрут для предпросмотра объявления
    path('search/', views.search_form_view, name='search_form'),  # Маршрут для формы поиска
    path('search/results/', views.search_articles_view, name='search_results'),  # Маршрут для результата поиска
    path('articles/delete/<int:pk>/', delete_article, name="delete_article"),
    path("my-responses/", views.my_responses, name="my_responses"),
    path("comments/approve/<int:comment_id>/", views.approve_comment, name="approve_comment"),
    path("comments/reject/<int:comment_id>/", views.reject_comment, name="reject_comment"),
    path("comments/delete/<int:comment_id>/", views.delete_comment, name="delete_comment"),
    path("articles/<int:pk>/comments/", views.all_comments, name="all_comments"),  # Просмотр всех комментариев
    path("comments/edit/<int:comment_id>/", views.edit_comment, name="edit_comment"),  # маршрут для редактирования комментария
    path("categories/<slug:slug>/articles/", views.articles_by_category_view, name="articles_by_category"), # Добавляем маршрут для фильтрации статей по категории



]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


