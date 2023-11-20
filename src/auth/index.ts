import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import jwt from 'jsonwebtoken';

export default function auth(
	socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) {
	const publicKey = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7F33JZmM7Zexudl7Rgmy
6S/SgJEOeIcC7KvYYfJAmPO27228f9IuQbvPSNBlzhdJ/lEnZE0pSqqcCIFabnW7
Pza/iG+zBw7JFio9OX0OIDOWqp41bIRc2F8XXfDCYRknopyEQSu2r3oGiRGQtEBr
ozWYcXHcuQssEuf0x5c/EuvjQmpDi9JYEEIcGD6MlMYcdsSYRho2/dmE5EeYnlRd
yUiIDHMuuetJxAugnJRkOBjq0I6P42ps3IyixGz/KHjGnRv4YIYos18jJep4r/Ro
XRG9B6S1K3MdjpqUquCZ4aCrnY5QDsJYZcXL9paVvJguNWP2alkrpwOOD0f3r2St
EQIDAQAB
-----END PUBLIC KEY-----
		`;

	try {
		const { token } = socket.handshake.auth;
		const verify = jwt.verify(token, publicKey);
		if (verify.sub) return verify;
	} catch (err) {
		return false;
	}
	return false;
}
