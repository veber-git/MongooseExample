//Источник https: //developer.mozilla.org/ru/docs/Learn/Server-side/Express_Nodejs/mongoose

//MONGO_URL: 'mongodb://localhost:27017/blog'

console.log('SERVER REFRESH');



//Импортируем модуль mongoose
const mongoose = require('mongoose');

//Устанавливаем подключение по-умолчанию
const mongoDbURL = 'mongodb://127.0.0.1/my_database_1';
mongoose.connect(mongoDbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//Позволяем mongoose испольовать глобальую библиотеку Prommise
mongoose.Promise = global.Promise;
mongoose.set('debug', true);

//Получение подключения по-умолчанию
let db = mongoose.connection;

// Привязать подключение к событию ошибки  (получать сообщения об ошибках подключения)
db
    //.on('error', error => reject(error))
    .on('error', console.error.bind(console, 'MONGODB CONNECTION ERROR:'))
    .on('close', () => console.log("Database connection closed"))
    .once('open', () => console.log("Database connection open"));

//Определяем схему
const Shema1 = mongoose.Schema;

const SomeModelShema = new Shema1({
    book: {
        type: String
    },
    author: String,
    date: {
        type: Date,
        default: Date.now
    }
});

//Создаем модель
let SomeModel = mongoose.model('SomeModel', SomeModelShema);

//Создаем экземпляр модели
let example_model = new SomeModel({
    name: 'example_model'
});

/*
//-------------------------------------------------------
//Изменяем данные в документе
example_model.book = 'Хождение по мукам';
example_model.author = 'Tolstoy';
example_model.date = '03.04.2020';



//Сохраняем экзкмпляр модели, передав callback
example_model.save(function (err) {
    if (err) return handleError(err);
    console.log('Example_model was saved');
    //db.close(console.log('I closed connection'));
});

*/


//-----------------------------------------------------
//Поиск записей по фамилии автора и выдача результатов поиска с полями автор  книга
let rec1 = () => {
    console.log("OK");
    SomeModel.find({
        'author': 'Tolstoy'
    }, 'author book', (err, result1) => {
        console.log('Результаты поиска со встроенным callback:')
        console.log('Результат 1:   ' + result1[0].book);
        console.log('');
    });
}

rec1();

//-------------------------------------------------------------------
//Если не задать callback-функцию, 
//API вернет переменную типа Query. Можно использовать объект запроса, чтобы создать и выполнить свой запрос (с callback-функцией) позже, при помощи метода exec().
//Найти все записи автора Tolstoy
let rec2 = SomeModel.find({
    'author': 'Tolstoy'
});
//Выбрать поля записей
rec2.select('book author');
//Ограничить результаты 2 элементами
rec2.limit(2);
//Сортировать по названию в обратном порядке
rec2.sort({
    'book': -1
});
//Выполнить callback позже
rec2.exec((err, myresult2) => {
    if (err) return handleError(err);
    console.log('Результаты поиска с вынесенным callback:')
    console.log('Результат 2    ' + myresult2);
    console.log('');
});

//-------------------------------------------------
//Можно также использовать функцию where(), кроме того, можно соединить все части в одном запросе применением оператора dot (.) вместо того, чтобы выполнять их раздельно
SomeModel.
find().
where('author').equals('Turgenev'). //фильтр по полю автора с указанным значением
//where('age').gt(17).lt(50)        //дополнительное условие - возраст (age) больше 17 и меньше 50
limit(2). //Указание лимита выводимого количества записей
sort({ //Сорировка по указанному полю с указанием направления сортировки
    'book': -1
}).
select('book author'). //Выбор выводимых полей записи
exec((err, myresult3) => { //Вызов callback
    if (err) return handleError(err);
    console.log('Поиск записей с расстановкой условий через точку:');
    console.log('Результат 3:   ' + myresult3);
    console.log('');
});


//-----------------------------------------------
//Поиск записи по параметрам и ее обновление
//Указание опций:
// установить new опцию в true для возврата обновленных занчений документа после update применения.
//upsert может использоваться для поиска и вставки (если в документе не найден обьект, то он будет вставлен)

//Выбираем запись по фильтру и изменяем значение требуемого поля
const filter1 = {
    author: 'Turgenev'
};
const update1 = {
    book: 'Заметки охотника'
};

let doc1 = SomeModel.findOneAndUpdate(filter1, update1, {
    new: true
}, (err) => {
    if (err) return handleError(err);
    console.log('Запись изменена');
});

//
//Выбираем запись по фильтру и изменяем значение требуемого поля, если записи нет - она создается
const filter2 = {
    author: 'Gogol'
};
const update2 = {
    book: 'Мертвые души'
};

let doc2 = SomeModel.findOneAndUpdate(filter2, update2, {
    new: true,
    upsert: true
}, (err) => {
    if (err) return handleError(err);
    console.log('Запись изменена или добавлена');
});


//----------------------------------------------
//Поиск записи по параметрам и ее удаление

const filter3 = {
    author: 'Gogol'
}
//Функция по удалению записи
let docDelete = () => {
    SomeModel.findOneAndDelete(filter3, (err) => {
        if (err) return handleError(err);
        console.log('Запись удалена');
    });
}

//Проверяем существование записи по фильтру и удаляем, если она существует
let checkExistense = () => {
    SomeModel.findOne(filter3, 'author', (err, checkResult) => {
        if (err) return handleError(err);
        console.log('Проверка существования: ' + checkResult);
        if (checkResult) {
            console.log('Запись существует: ' + checkResult);
            docDelete();
        } else {
            console.log('Удаляемая запись не существует');
        }
    })
}
checkExistense();