'use client'

import Navbar from "@/shared/components/navbar";
import styles from "./page.module.css";
import Input from "@/shared/components/input";
import Switch from "@/shared/components/switch";
import { useFetch } from "@/hooks/useFetch";
import { useEffect, useRef, useState } from "react";
import { Shortener } from "@/models/shortener.model";
const LS_JOJOS_AUTOCLIPBOARD = 'jojos-autoclipboard';

export default function Home() {
    const [shortLink, setShortLink] = useState('');
    const [autoCopy, setAutoCopy] = useState(false);
    const spanRef = useRef<HTMLSpanElement>(null);
    const { data, isLoading, fetchData, error, setData } = useFetch<Shortener | null>('/shortener', { method: 'POST', body: JSON.stringify({ url: shortLink }) });

    /**
     * once the results arrive us save to the clipboard
     */
    const onShortLink = async () => {
        await fetchData();
        if(autoCopy) {
            setTimeout(() => {
                spanRef.current?.click()
            }, 1000)
        }
    }


    /**
     * Automatic selection when user clicks on the object
     */
    const onSelectAll = () => {
        if (spanRef.current && window) {
            const range = document.createRange();
            range.selectNodeContents(spanRef.current);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);

            const text = spanRef.current.textContent || '';
            clipboardAction(text);
        }
    }

    /**
     * Keep in local storage for future visits.
     */
    const autoClipboard = () => {
        localStorage.setItem(LS_JOJOS_AUTOCLIPBOARD, String(!autoCopy))
        setAutoCopy(!autoCopy)
    }

    /**
     * Need it to keep result url shorten
     * @param text text to save to the clipboard
     */
    const clipboardAction = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            alert("Text copied to clipboard—swift and precise, like Star Platinum&rsquo;s ORA-ORA-ORA!");
        } catch (error) {
            console.error("Error copying the text—DIO stopped time before it could finish!: ", error);
        }
    }

    const again = () => {
        setShortLink('');
        setData(null);
    }

    useEffect(() => {
        if(error) alert(error);
    }, [error])

    useEffect(() => {
        const localStorageValue = window.localStorage.getItem(LS_JOJOS_AUTOCLIPBOARD);
        setAutoCopy(localStorageValue ? eval(localStorageValue ?? 'false') : false);
    }, []);

    return (
        <>
            <main className={styles['wrapper']}>
                <Navbar />
                <section className={styles['page__content']}>
                    <h1></h1>
                    <p>JoJo&apos;s Click: Precision and Speed, Like Star Platinum&apos;s Punches!</p>
                    <div className={styles['convert__container']}>
                        <Input
                            onChange={({ target: { value } }) => setShortLink(value)}
                            value={shortLink}
                            onButtonClick={!data?.short ? onShortLink : again}
                            loading={isLoading}
                            disabled={!!data?.short}
                            labelButton={!data?.short ? 'Shorten!' : 'Again!'}
                            placeholder="Enter the link here" />

                        <section className={styles['options__container']}>
                            <div className={styles['switch__container']}>
                                <Switch checked={autoCopy} onChange={() => autoClipboard()} />
                                <p>Auto Paste from Clipboard</p>
                            </div>
                            {data?.short && <div>
                                <label>Your link is shortened—Next you&apos;ll say: &quot;OH MY GOD! This is so fast!&quot;</label>
                            </div>}
                            {data?.short &&
                                <span ref={spanRef} style={{ cursor: 'pointer', userSelect: 'text' }} onClick={onSelectAll} className={styles['option__result']}>{data?.short}</span>
                            }
                        </section>
                    </div>
                </section>
            </main>
        </>
    );
}
