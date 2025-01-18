# /GuildPost/posts/forms.py

from django import forms
from .models import Article
from tinymce.widgets import TinyMCE


class ArticleForm(forms.ModelForm):
    content = forms.CharField(
        widget=TinyMCE(
            attrs={
                'cols': 80,
                'rows': 15,
            },
            mce_attrs={
                "plugins": "image media link code",
                "toolbar": "undo redo | styleselect | bold italic | link image media | code",
                "height": 300,
            },
        )
    )

    class Meta:
        model = Article
        fields = ['title', 'content', 'category']
