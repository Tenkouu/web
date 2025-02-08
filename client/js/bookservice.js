export class BookService {
    // Номын жагсаалтыг серверээс татах.
    static async getBooks(params = {}) {
        // API-д илгээх хүсэлтийг хийж, хариуг буцаана.
        return this._fetch('/api/books', params);
    }

    // Нэг номын дэлгэрэнгүй мэдээллийг серверээс авах.
    static async getBookById(id) {
        // ID ашиглан тодорхой номын мэдээлэл татах.
        return this._fetch(`/api/books/${id}`);
    }

    // Шинэ номыг сервер рүү илгээж бүртгэх.
    static async addBook(bookData) {
        // Номын өгөгдлийг JSON форматаар илгээнэ.
        return this._fetch('/api/books', null, {
          method: 'POST', // Ном нэмэх HTTP арга.
          headers: {
            'Content-Type': 'application/json', // Серверт JSON өгөгдөл илгээж байгааг мэдэгдэнэ.
          },
          body: JSON.stringify(bookData), // Номын өгөгдлийг JSON болгон хөрвүүлэх.
        });
    }

    // Номын мэдээллийг сервер дээр шинэчлэх.
    static async updateBook(id, bookData) {
        // ID ашиглан тодорхой номыг шинэчлэх.
        return this._fetch(`/api/books/${id}`, null, {
            method: 'PUT', // HTTP арга: PUT нь өгөгдлийг шинэчлэхэд ашиглагдана.
            headers: {
                'Content-Type': 'application/json' // JSON өгөгдөл илгээж байгааг серверт мэдэгдэнэ.
            },
            body: JSON.stringify(bookData) // Шинэ өгөгдлийг JSON болгон хөрвүүлэх.
        });
    }

    // Номыг серверээс устгах.
    static async deleteBook(id) {
        // Тодорхой ID бүхий номыг устгах хүсэлтийг серверт илгээх.
        return this._fetch(`/api/books/${id}`, null, { method: 'DELETE' });
    }

    // Бүх API хүсэлтүүдэд ашиглах үндсэн fetch функц.
    static async _fetch(endpoint, params = null, options = {}) {
        // URL-ийг серверийн үндсэн хаягаар бүтээх.
        const url = new URL(endpoint, window.location.origin);

        // Хэрэв параметр байвал URL-д нэмнэ.
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value) url.searchParams.set(key, value); // URL-д параметр нэмэх.
            });
        }

        // Хүсэлтийн үндсэн тохиргоо.
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json' // Бүх хүсэлтэд JSON форматыг зааж өгнө.
            }
        };

        try {
            // Fetch ашиглан сервер рүү хүсэлт илгээх.
            const response = await fetch(url, { ...defaultOptions, ...options });
            // Хэрэв хариу OK биш бол алдаа шидэх.
            if (!response.ok) throw new Error(`HTTP алдаа! Статус: ${response.status}`);
            return await response.json(); // Хариуг JSON формат руу хөрвүүлж буцаана.
        } catch (error) {
            // Хэрэв хүсэлт амжилтгүй бол алдааг шидэх.
            throw new Error(`API хүсэлт амжилтгүй боллоо: ${error.message}`);
        }
    }
}
