"""
/GuildPost/accounts/view.py
"""

# from .utils import send_activation_email
# from django.core.mail import send_mail
# from django.utils.timezone import now
# from django.conf import settings

# Импортируем дополнительные инструменты для оптимизации
from django.db.models import Prefetch

from GuildPost import settings
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from .models import Profile, ActivationCode, RecoveryCode
from django.utils.timezone import now, timedelta
from django.contrib.auth.decorators import login_required
import uuid
import logging
from GuildPost.models import MenuItem

logger = logging.getLogger(__name__)


# def home(request):
#     print("Функция home вызвана!")  # Добавляем отладочный вывод
#     """
#     Представление для главной страницы. Проверяет, авторизован ли пользователь,
#     и отображает соответствующий бокс (login.html или logout.html).
#     Загружает пункты меню.
#     """
#     menu_items = MenuItem.objects.all()  # Получаем все пункты меню из базы данных
#     print(f"Пункты меню: {menu_items}")  # Отладочный вывод в консоль
#     return render(request, "home.html", {"menu_items": menu_items})  # Передаём их в шаблон


def login_view(request):
    """
    Обрабатывает запросы на авторизацию. Возвращает ошибки при неверных данных.
    """
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)
            return redirect('home')  # Перенаправление на главную страницу
        else:
            # Устанавливаем флаг ошибки в сессии
            request.session['login_error'] = True
            return redirect('login')  # Перенаправление на главную страницу

    return redirect('home')  # Перенаправление на главную страницу


def logout_view(request):
    """
    Обрабатывает запросы на выход. Завершает сессию пользователя
    и перенаправляет его на главную страницу.
    """
    logout(request)
    return redirect('home')  # Перенаправление на главную страницу после выхода


def login_error(request):
    """
    Возвращает HTML-код страницы login_error.html.
    """
    return render(request, 'login_error.html')


def clear_login_error(request):
    """
    Очищает флаг ошибки логина в сессии и перенаправляет на главную страницу.
    """
    if 'login_error' in request.session:
        del request.session['login_error']  # Удаляем флаг ошибки логина из сессии
    return redirect('home')  # Перенаправляем на главную страницу


def register_view(request):
    """
    Обрабатывает запросы на регистрацию.
    """
    print("Форма активации сработала")  # Для отладки

    if request.method == "POST":
        print("Метод пост сработал")  # Для отладки

        # Получение данных из формы
        username = request.POST.get("username")
        password = request.POST.get("password")
        password_confirm = request.POST.get("password_confirm")
        email = request.POST.get("email")
        first_name = request.POST.get("first_name")
        last_name = request.POST.get("last_name")
        birth_date = request.POST.get("birth_date")
        gender = request.POST.get("gender")
        avatar = request.FILES.get("avatar")  # Получение загруженного файла
        avatar_url = request.POST.get("avatar_url")  # Получение URL аватара
        subscribe = request.POST.get("subscribe") == "on"
        privacy_policy_accepted = request.POST.get("privacy_policy") == "on"

        # Список для ошибок
        errors = []

        # Проверка корректности данных
        if password != password_confirm:
            errors.append("Пароли не совпадают.")
        if User.objects.filter(username=username).exists():
            errors.append("Пользователь с таким логином уже существует.")
        if User.objects.filter(email=email).exists():
            errors.append("Пользователь с таким e-mail уже существует.")
        if not privacy_policy_accepted:
            errors.append("Вы должны принять политику конфиденциальности.")

        # Если есть ошибки, возвращаем HTML с их отображением
        if errors:
            print("Ошибки при регистрации:", errors)  # Для отладки
            return render(request, 'register_errors.html', {'errors': errors})

        # Создание пользователя
        try:
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email,
                is_active=False,
                first_name=first_name,
                last_name=last_name
            )
            user.save()

            # Создание профиля
            profile = Profile.objects.create(
                user=user,
                birth_date=birth_date,
                gender=gender,
                subscribe=subscribe,
                privacy_policy_accepted=privacy_policy_accepted,
            )
            # Обработка аватарки
            if avatar:
                profile.avatar = avatar  # Сохраняем загруженный файл в поле avatar
            elif avatar_url:
                profile.avatar = avatar_url  # Сохраняем URL в поле avatar

            profile.save()  # Сохраняем изменения профиля

            # # Генерация кода активации
            # activation_code = ActivationCode.objects.create(user=user)
            #
            # # Отправка письма для активации
            # send_activation_email(user, activation_code.code)

            # Возвращаем HTML для отображения формы активации
            return render(request, 'activation.html', {'email': email})

        except Exception as e:
            # Обработка ошибок при создании пользователя
            print(f"Ошибка при регистрации пользователя: {e}")  # Логирование
            return render(request, 'register.html', {'errors': ["Ошибка при создании учетной записи."]})

    # Если запрос не POST, возвращаем форму регистрации
    print("Неверный запрос, метод не поддерживается.")  # Логирование
    return render(request, 'register.html')


def activate_account(request):
    """     Обрабатывает активацию аккаунта через код активации.     """

    print("Форма активации сработала")  # Для отладки

    if request.method == "POST":  # Проверка, что запрос POST
        code = request.POST.get("activation_code")  # Получаем код активации из формы
        print(f"Получены: activation_code={code}")  # Логирование полученного кода

        if not code:  # Если код не предоставлен, возвращаем сообщение об ошибке
            return HttpResponse("Код активации не предоставлен.", status=400)

        try:
            # Ищем запись кода активации
            activation_entry = get_object_or_404(ActivationCode, code=code)
            user = activation_entry.user

            if user.is_active:  # Если пользователь уже активирован
                return HttpResponse("Ваш аккаунт уже активирован.", status=400)

            # Активация пользователя
            user.is_active = True
            user.save()
            print(f"Пользователь {user.username} активирован.")  # Логирование активации

            # Удаляем запись кода активации
            activation_entry.delete()
            print("Код активации удалён.")  # Логирование удаления кода



            # Возвращаем сообщение об успешной активации
            return render(request, 'activ.html', {
                'success': True,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'message': "Ваш аккаунт успешно активирован."
            })

        except ActivationCode.DoesNotExist:  # Если код активации не найден
            print("Код активации не найден.")  # Логирование ошибки
            return render(request, 'activ.html', {
                'success': False,
                'message': "Код активации неверен или устарел."
            })

        except Exception as e:  # Обработка других ошибок
            print(f"Ошибка активации: {e}")  # Логирование ошибки
            return render(request, 'activ.html', {
                'success': False,
                'message': "Произошла ошибка активации. Попробуйте позже."
            })

    # Если запрос не POST, возвращаем сообщение об ошибке
    print("Неверный запрос, метод не поддерживается.")  # Логирование ошибки
    return HttpResponse("Неверный запрос. Метод не поддерживается.", status=405)


def recovery_password(request):
    """     Отображает форму восстановления пароля.     """
    print("форму восстановления пароля сработала. Загружает recovery_password.html")  # Логирование ошибки
    if request.method == "GET":
        return render(request, "recovery_password.html")
    elif request.method == "POST":
        return render(request, 'recovery_password.html')



def password_recovery_request(request):
    """     Обрабатывает запрос на отправку кода восстановления.     """
    print("запрос на отправку кода восстановления сработала. Загружает recovery_code.html")
    if request.method == "POST":
        # Получаем логин и email из запроса
        username = request.POST.get("username")
        email = request.POST.get("email")

        # Проверяем существование пользователя
        user = User.objects.filter(username=username, email=email).first()
        if not user:
            # Если пользователь не найден, отображаем ошибку
            return render(request, 'recovery_code_error.html', {'error': "Invalid username or email."})

        # Генерация нового кода восстановления
        recovery_code = RecoveryCode.objects.create(
            user=user,
            code=str(uuid.uuid4()),  # Генерация уникального кода
            expires_at=now() + timedelta(seconds=settings.RECOVERY_CODE_VALIDITY_SECONDS)  # Время действия кода
        )

        # Проверяем оставшиеся попытки после создания нового кода
        attempts_left = RecoveryCode.get_attempts_left(user)
        if attempts_left == 0:
            # Если попытки исчерпаны, отображаем сообщение о блокировке
            return render(request, 'recovery_code_error.html', {
                'error': "Вы исчерпали все попытки. Попробуйте восстановить пароль через 30 минут."
            })

        # Возврат страницы с данными о коде
        return render(request, 'recovery_code.html', {
            'attempts_left': attempts_left - 1,  # Уменьшаем оставшиеся попытки
            'code_validity_seconds': settings.RECOVERY_CODE_VALIDITY_SECONDS,  # Время действия кода
            'disable_password_recovery': False,  # Блокировка отключена
        })

    return HttpResponseBadRequest("Invalid request method.")


def password_recovery_code(request):
    """     Обрабатывает проверку кода восстановления и управление отображением счётчиков.     """
    print("проверку кода восстановления и управление отображением счётчиков.. Загружает recovery_code.html")
    if request.method == "POST":
        # Получаем код восстановления из POST-запроса
        code = request.POST.get("code")

        # Проверяем существование кода и его срок действия
        recovery_entry = RecoveryCode.objects.filter(code=code, expires_at__gt=now()).select_related("user").first()

        # Если код не найден или истёк, возвращаем ошибку
        if not recovery_entry:
            # Получаем оставшиеся попытки из сессии, если они существуют, иначе устанавливаем 0
            attempts_left = request.session.get('attempts_left', 0)
            code_validity_seconds = (recovery_entry.expires_at - now()).seconds if recovery_entry else 0

            # Если попыток не осталось, устанавливаем блокировку
            disable_password_recovery = attempts_left == 0

            return render(
                request,
                'recovery_code.html',
                {
                    'error': "Invalid or expired recovery code.",
                    'attempts_left': attempts_left,
                    'code_validity_seconds': code_validity_seconds,
                    'disable_password_recovery': disable_password_recovery,
                }
            )

        # Если код действителен, переходим к смене пароля
        return render(request, 'change_password.html', {'username': recovery_entry.user.username})

    # Если метод GET, возвращаем начальное состояние с настройкой счётчиков
    attempts_left = request.session.get('attempts_left', 2)  # Осталось попыток (по умолчанию 2)
    code_validity_seconds = request.session.get('code_validity_seconds',
                                                900)  # Время действия кода (по умолчанию 15 минут)

    # Проверяем, нужно ли блокировать восстановление
    disable_password_recovery = attempts_left == 0 and code_validity_seconds <= 0

    print({
        '!!!!!!!!!!!!!!!!  code_validity_seconds': code_validity_seconds,
        '!!!!!!!!!!!!!!!!  attempts_left': attempts_left,
        '!!!!!!!!!!!!!!!!  disable_password_recovery': disable_password_recovery,
    })

    # Передаём данные для отображения счётчиков и состояния блокировки
    return render(
        request,
        'recovery_code.html',
        {
            'attempts_left': attempts_left,
            'code_validity_seconds': code_validity_seconds,
            'disable_password_recovery': disable_password_recovery,
        }
    )


def password_change(request):
    print("Работает с формой восстановления пароля. Загружает restored_password.html")
    if request.method == "POST":
        username = request.POST.get("username")
        new_password = request.POST.get("new_password")
        confirm_password = request.POST.get("confirm_password")
        if new_password != confirm_password:
            return render(request, 'change_password.html', {'error': "Passwords do not match."})
        user = User.objects.get(username=username)
        user.set_password(new_password)
        user.save()
        return render(request, 'restored_password.html')
    return render(request, 'change_password.html')


def password_restored(request):
    return render(request, 'restored_password.html')


def upload_avatar(request):
    """
    Обрабатывает загрузку аватара через URL.
    """
    if request.method == "POST":
        avatar_url = request.POST.get("avatar_url")  # Получаем URL из формы
        if avatar_url:
            request.user.profile.avatar = avatar_url  # Сохраняем URL аватара в профиле пользователя
            request.user.profile.save()  # Сохраняем изменения
            return JsonResponse({"status": "success", "message": "Аватар обновлен"})  # Успешный ответ
        return JsonResponse({"status": "error", "message": "URL аватара отсутствует"})  # Ошибка: URL отсутствует
    return JsonResponse({"status": "error", "message": "Неверный метод запроса"})  # Ошибка: неверный метод


def test_error_view(request):
    """
    Временное представление для проверки логирования ошибок.
    """
    # Намеренно вызываем исключение
    raise ValueError("Тестовая ошибка для проверки логирования.")

    return HttpResponse("Это никогда не будет достигнуто.")


@login_required
def profile_view(request):
    """
    Возвращает HTML-контент с профилем текущего пользователя.
    Доступно только авторизованным пользователям.
    """
    return render(request, 'profile.html', {'user': request.user})
