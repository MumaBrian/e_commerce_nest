export const generateRandomString = (length: number): string => {
	return Math.random().toString(36).substr(2, length);
};
