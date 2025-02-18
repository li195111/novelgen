import { useCallback, useEffect, useState } from 'react';

// 定義序列化的型別限制
type StorageValue = string | number | boolean | null | object;

// 自定義 Storage 事件型別
interface CustomStorageEvent extends StorageEvent {
    key: string;
    newValue: string | null;
    oldValue: string | null;
}

// Hook 的回傳型別
type SetValue<T> = (value: T | ((prevValue: T) => T)) => void;
type UseLocalStorageReturn<T> = [T, SetValue<T>];

/**
 * localStorage Hook with TypeScript support
 * @param key - localStorage key
 * @param initialValue - default value
 * @returns [storedValue, setValue] tuple
 */

export function useLocalStorage<T extends StorageValue>(
    key: string,
    initialValue: T
): UseLocalStorageReturn<T> {
    // 初始化狀態
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (!item) {
                // 如果 localStorage 沒有值，則設定初始值
                window.localStorage.setItem(key, JSON.stringify(initialValue));
                return initialValue;
            }
            return (JSON.parse(item) as T);
        } catch (error) {
            console.error('Error reading localStorage key "${key}":', error);
            return initialValue;
        }
    });

    // 更新 localStorage 的函數
    const setValue: SetValue<T> = useCallback(
        (value) => {
            try {
                // 允許傳入函數來更新值
                const valueToStore = value instanceof Function ? value(storedValue) : value;
                setStoredValue(valueToStore);

                // 更新 localStorage
                const valueString = JSON.stringify(valueToStore);
                window.localStorage.setItem(key, valueString);

                // 觸發自定義事件
                const event = new StorageEvent('storage', {
                    key,
                    newValue: valueString,
                    oldValue: localStorage.getItem(key),
                    storageArea: localStorage,
                }) as CustomStorageEvent;

                window.dispatchEvent(event);
            } catch (error) {
                console.error('Error saving to localStorage key "${key}":', error);
            }
        },
        [key, storedValue]
    );

    // 監聽其他視窗的更改
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === key && event.newValue !== null) {
                try {
                    const newValue = JSON.parse(event.newValue) as T;
                    setStoredValue(newValue);
                } catch (error) {
                    console.error('Error parsing storage value for key "${key}":', error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key]);

    return [storedValue, setValue];
}
